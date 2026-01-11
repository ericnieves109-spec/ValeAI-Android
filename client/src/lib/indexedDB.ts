const DB_NAME = "ValeAI";
const DB_VERSION = 1;
const CONTENT_STORE = "academicContent";
const MEDIA_STORE = "mediaFiles";

export interface AcademicContent {
  id: string;
  grade: "9" | "10" | "11";
  subject: string;
  topic: string;
  content: string;
  mediaIds: string[];
  keywords: string[];
  timestamp: number;
}

export interface MediaFile {
  id: string;
  type: "image" | "video";
  data: Blob;
  filename: string;
  timestamp: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        const contentStore = db.createObjectStore(CONTENT_STORE, { keyPath: "id" });
        contentStore.createIndex("grade", "grade", { unique: false });
        contentStore.createIndex("subject", "subject", { unique: false });
        contentStore.createIndex("keywords", "keywords", { unique: false, multiEntry: true });
      }

      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveContent(content: AcademicContent): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE], "readwrite");
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.put(content);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveMedia(media: MediaFile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEDIA_STORE], "readwrite");
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.put(media);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllContent(): Promise<AcademicContent[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE], "readonly");
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getMediaById(id: string): Promise<MediaFile | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEDIA_STORE], "readonly");
    const store = transaction.objectStore(MEDIA_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function searchContent(query: string): Promise<AcademicContent[]> {
  const allContent = await getAllContent();
  const lowerQuery = query.toLowerCase();

  return allContent.filter((content) => {
    return (
      content.topic.toLowerCase().includes(lowerQuery) ||
      content.content.toLowerCase().includes(lowerQuery) ||
      content.subject.toLowerCase().includes(lowerQuery) ||
      content.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  });
}

export async function getContentByGrade(grade: "9" | "10" | "11"): Promise<AcademicContent[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE], "readonly");
    const store = transaction.objectStore(CONTENT_STORE);
    const index = store.index("grade");
    const request = index.getAll(grade);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getDatabaseStats(): Promise<{ contentCount: number; mediaCount: number }> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONTENT_STORE, MEDIA_STORE], "readonly");
    const contentStore = transaction.objectStore(CONTENT_STORE);
    const mediaStore = transaction.objectStore(MEDIA_STORE);

    const contentRequest = contentStore.count();
    const mediaRequest = mediaStore.count();

    let contentCount = 0;
    let mediaCount = 0;

    contentRequest.onsuccess = () => {
      contentCount = contentRequest.result;
    };

    mediaRequest.onsuccess = () => {
      mediaCount = mediaRequest.result;
    };

    transaction.oncomplete = () => {
      resolve({ contentCount, mediaCount });
    };

    transaction.onerror = () => reject(transaction.error);
  });
}
