import { Router } from "express";
// import { db } from "./db.js";
import { InyeccionGemini25 } from "./extraccion.js";
import multer from "multer";
import { 
  processIndividualFile, 
  analyzeContentWithGemini, 
  saveProcessedFile,
  checkInternetConnection 
} from "./fileProcessor.js";

const router = Router();

// Ejecutar carga inicial de Gemini 2.5
router.post("/api/gemini/cargar", async (req, res) => {
  try {
    console.log("Iniciando carga manual de Gemini 2.5 Flash...");
    const result = await InyeccionGemini25.ejecutarCargaManual();
    
    // Después de cargar Gemini, agregar conocimiento expandido
    await expandKnowledgeBase();
    
    res.json({ success: true, message: result });
  } catch (error) {
    console.error("Error en carga Gemini:", error);
    res.status(500).json({ error: "Failed to load Gemini data" });
  }
  return;
});

// Función para expandir la base de conocimientos con contenido detallado
async function expandKnowledgeBase() {
  console.log("Expandiendo base de conocimientos...");
  
  const expandedKnowledge = [
    // MATEMÁTICAS - Álgebra
    {
      materia: "Matemáticas - Álgebra",
      tema: "Ecuaciones Lineales",
      contenido: "Una ecuación lineal es una igualdad algebraica de primer grado. Forma general: ax + b = c. Pasos para resolver: 1) Aislar términos con variable, 2) Despejar la variable, 3) Verificar solución. Ejemplo: 2x + 5 = 13 → 2x = 8 → x = 4. Aplicaciones en física, economía y ciencias naturales.",
      grado: "8vo-9no",
      palabras_clave: "ecuaciones,lineales,algebra,resolver,despeje,primer grado",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Álgebra",
      tema: "Sistemas de Ecuaciones",
      contenido: "Sistema de dos o más ecuaciones con variables comunes. Métodos de solución: Sustitución (despejar una variable y sustituir), Igualación (igualar expresiones), Eliminación (sumar/restar para eliminar variable). Ejemplo 2x2: x+y=5, 2x-y=1 → Solución: x=2, y=3. Representa intersección de rectas en plano cartesiano.",
      grado: "9no-10mo",
      palabras_clave: "sistemas,ecuaciones,sustitucion,igualacion,eliminacion,variables",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Álgebra",
      tema: "Factorización",
      contenido: "Descomponer expresión algebraica en producto de factores. Tipos: Factor común (ax+ay=a(x+y)), Diferencia de cuadrados (a²-b²=(a+b)(a-b)), Trinomio cuadrado perfecto (a²+2ab+b²=(a+b)²), Trinomio de la forma x²+bx+c. Esencial para simplificar expresiones y resolver ecuaciones.",
      grado: "9no-10mo",
      palabras_clave: "factorizacion,factor comun,diferencia cuadrados,trinomio,algebra",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Álgebra",
      tema: "Función Cuadrática",
      contenido: "Función de segundo grado: f(x) = ax² + bx + c (a≠0). Gráfica: parábola. Vértice V(-b/2a, f(-b/2a)). Abre hacia arriba si a>0, hacia abajo si a<0. Discriminante Δ=b²-4ac determina número de raíces. Aplicaciones: movimiento parabólico, optimización, economía.",
      grado: "10mo-11vo",
      palabras_clave: "cuadratica,parabola,vertice,discriminante,raices,segundo grado",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Álgebra",
      tema: "Logaritmos",
      contenido: "Logaritmo es el exponente al que debe elevarse la base para obtener un número: log_b(x)=y ↔ b^y=x. Propiedades: log(ab)=log(a)+log(b), log(a/b)=log(a)-log(b), log(a^n)=n·log(a). Logaritmo natural ln (base e≈2.718). Aplicaciones en crecimiento exponencial, pH, decibeles.",
      grado: "11vo-12vo",
      palabras_clave: "logaritmos,exponentes,propiedades,logaritmo natural,base e",
      tipo: "expandido"
    },

    // MATEMÁTICAS - Geometría
    {
      materia: "Matemáticas - Geometría",
      tema: "Teorema de Pitágoras",
      contenido: "En triángulo rectángulo: a² + b² = c², donde c es hipotenusa y a,b son catetos. Permite calcular lado desconocido conociendo dos lados. Aplicaciones: distancias, construcción, navegación. Ejemplo: catetos 3 y 4 → hipotenusa = √(9+16) = 5. Recíproco: si cumple relación, triángulo es rectángulo.",
      grado: "8vo-9no",
      palabras_clave: "pitagoras,triangulo rectangulo,hipotenusa,catetos,teorema",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Geometría",
      tema: "Áreas y Perímetros",
      contenido: "Perímetro: suma de lados. Área: espacio interior. Fórmulas clave - Cuadrado: P=4l, A=l². Rectángulo: P=2(b+h), A=b×h. Triángulo: P=a+b+c, A=(b×h)/2. Círculo: P=2πr, A=πr². Trapecio: A=((B+b)×h)/2. Aplicaciones en construcción, diseño, agricultura.",
      grado: "7mo-8vo",
      palabras_clave: "area,perimetro,figuras geometricas,formulas,calculo",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Geometría",
      tema: "Volumen y Superficie",
      contenido: "Volumen: espacio ocupado (unidades cúbicas). Superficie: área total de caras. Cubo: V=l³, S=6l². Prisma rectangular: V=l×w×h. Cilindro: V=πr²h, S=2πr²+2πrh. Esfera: V=(4/3)πr³, S=4πr². Pirámide: V=(1/3)×base×altura. Cono: V=(1/3)πr²h. Aplicaciones en envases, arquitectura.",
      grado: "9no-10mo",
      palabras_clave: "volumen,superficie,solidos,cuerpos geometricos,formulas 3D",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Geometría",
      tema: "Semejanza y Congruencia",
      contenido: "Congruencia: figuras idénticas (mismo tamaño y forma) ≅. Criterios triángulos: LAL, ALA, LLL. Semejanza: misma forma, diferente tamaño ∼. Criterios: AA (dos ángulos iguales), LAL (lados proporcionales y ángulo igual), LLL (tres lados proporcionales). Razón de semejanza k: relación entre lados correspondientes. Aplicaciones en escalas, mapas, fotografía.",
      grado: "9no-10mo",
      palabras_clave: "semejanza,congruencia,triangulos,proporcionalidad,criterios",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Geometría",
      tema: "Geometría Analítica",
      contenido: "Estudio de figuras mediante coordenadas. Distancia entre puntos: d=√((x₂-x₁)²+(y₂-y₁)²). Punto medio: M((x₁+x₂)/2, (y₁+y₂)/2). Pendiente recta: m=(y₂-y₁)/(x₂-x₁). Ecuación recta: y=mx+b (pendiente-ordenada), Ax+By+C=0 (general). Circunferencia: (x-h)²+(y-k)²=r². Une álgebra y geometría.",
      grado: "10mo-11vo",
      palabras_clave: "geometria analitica,coordenadas,distancia,pendiente,ecuacion recta",
      tipo: "expandido"
    },

    // MATEMÁTICAS - Trigonometría
    {
      materia: "Matemáticas - Trigonometría",
      tema: "Razones Trigonométricas",
      contenido: "En triángulo rectángulo: sen(θ)=opuesto/hipotenusa, cos(θ)=adyacente/hipotenusa, tan(θ)=opuesto/adyacente. Recíprocas: csc=1/sen, sec=1/cos, cot=1/tan. Identidad fundamental: sen²θ + cos²θ = 1. Ángulos notables: 30°, 45°, 60°. Aplicaciones en navegación, arquitectura, física.",
      grado: "10mo-11vo",
      palabras_clave: "trigonometria,seno,coseno,tangente,razones trigonometricas,angulos",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Trigonometría",
      tema: "Ley de Senos y Cosenos",
      contenido: "Ley de Senos: a/sen(A) = b/sen(B) = c/sen(C). Útil cuando conocemos un lado y ángulos opuestos. Ley de Cosenos: c² = a² + b² - 2ab·cos(C). Generaliza Pitágoras para triángulos no rectángulos. Aplicaciones: topografía, astronomía, ingeniería. Permiten resolver triángulos oblicuángulos.",
      grado: "11vo-12vo",
      palabras_clave: "ley senos,ley cosenos,triangulos oblicuangulos,resolucion triangulos",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Trigonometría",
      tema: "Identidades Trigonométricas",
      contenido: "Ecuaciones que se cumplen para cualquier ángulo. Pitagóricas: sen²θ+cos²θ=1, tan²θ+1=sec²θ, 1+cot²θ=csc²θ. Suma/diferencia: sen(A±B)=senA·cosB±cosA·senB, cos(A±B)=cosA·cosB∓senA·senB. Doble ángulo: sen(2θ)=2senθ·cosθ, cos(2θ)=cos²θ-sen²θ. Útiles para simplificar expresiones.",
      grado: "11vo-12vo",
      palabras_clave: "identidades,trigonometria,pitagoricas,suma angulos,doble angulo",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Trigonometría",
      tema: "Funciones Trigonométricas",
      contenido: "Funciones periódicas. f(x)=sen(x): período 2π, amplitud 1, dominio ℝ, rango [-1,1]. f(x)=cos(x): similar a seno, desfasada π/2. f(x)=tan(x): período π, asíntotas verticales en x=π/2+nπ. Transformaciones: A·sen(Bx+C)+D donde A=amplitud, B afecta período (2π/B), C=desfase, D=desplazamiento vertical. Modelan ondas, movimiento armónico.",
      grado: "11vo-12vo",
      palabras_clave: "funciones trigonometricas,graficas,periodo,amplitud,transformaciones",
      tipo: "expandido"
    },

    // MATEMÁTICAS - Cálculo
    {
      materia: "Matemáticas - Cálculo",
      tema: "Límites",
      contenido: "Comportamiento de función cuando x se aproxima a un valor. lim(x→a) f(x) = L significa f(x) se acerca a L cuando x se acerca a a. Propiedades: límite de suma/producto/cociente. Límites laterales: por izquierda (x→a⁻) y derecha (x→a⁺). Indeterminaciones: 0/0, ∞/∞. Base del cálculo diferencial e integral.",
      grado: "11vo-12vo",
      palabras_clave: "limites,calculo,aproximacion,continuidad,indeterminaciones",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Cálculo",
      tema: "Derivadas",
      contenido: "Tasa de cambio instantánea. f'(x) = lim(h→0) [f(x+h)-f(x)]/h. Interpretación: pendiente de recta tangente. Reglas: potencia (d/dx x^n = nx^(n-1)), producto, cociente, cadena. Derivada de sen(x)=cos(x), cos(x)=-sen(x), e^x=e^x, ln(x)=1/x. Aplicaciones: velocidad, aceleración, optimización, análisis funciones.",
      grado: "12vo",
      palabras_clave: "derivadas,calculo diferencial,tasa cambio,tangente,reglas derivacion",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Cálculo",
      tema: "Integrales",
      contenido: "Área bajo curva, antiderivada. ∫f(x)dx: integral indefinida (familia funciones + C). ∫[a,b]f(x)dx: integral definida (valor numérico). Teorema fundamental: ∫[a,b]f(x)dx = F(b)-F(a) donde F'=f. Técnicas: sustitución, por partes. Aplicaciones: áreas, volúmenes, trabajo, probabilidad, economía.",
      grado: "12vo",
      palabras_clave: "integrales,calculo integral,area bajo curva,antiderivada,teorema fundamental",
      tipo: "expandido"
    },

    // MATEMÁTICAS - Estadística y Probabilidad
    {
      materia: "Matemáticas - Estadística",
      tema: "Medidas de Tendencia Central",
      contenido: "Media (promedio): suma de datos / cantidad. Mediana: valor central al ordenar datos. Moda: dato más frecuente. Media sensible a valores extremos, mediana robusta. Ejemplo: {2,3,3,5,100} → Media=22.6, Mediana=3, Moda=3. Uso: analizar distribuciones, comparar conjuntos datos, estadística descriptiva.",
      grado: "8vo-9no",
      palabras_clave: "estadistica,media,mediana,moda,tendencia central,promedio",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Estadística",
      tema: "Medidas de Dispersión",
      contenido: "Rango: máximo - mínimo. Varianza: promedio de (dato - media)². Desviación estándar σ: √varianza, mismas unidades que datos. Coeficiente variación: σ/media × 100%. Mayor dispersión indica mayor variabilidad. Aplicaciones: control calidad, finanzas, investigación científica. Complementan medidas centrales.",
      grado: "9no-10mo",
      palabras_clave: "dispersion,varianza,desviacion estandar,rango,variabilidad",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Probabilidad",
      tema: "Probabilidad Básica",
      contenido: "P(evento) = casos favorables / casos posibles, entre 0 y 1. Evento seguro: P=1, imposible: P=0. Complemento: P(A') = 1-P(A). Suma: P(A∪B) = P(A)+P(B)-P(A∩B). Eventos mutuamente excluyentes: P(A∩B)=0. Independientes: P(A∩B)=P(A)×P(B). Aplicaciones: juegos, seguros, toma decisiones.",
      grado: "9no-10mo",
      palabras_clave: "probabilidad,eventos,azar,combinatoria,casos favorables",
      tipo: "expandido"
    },
    {
      materia: "Matemáticas - Estadística",
      tema: "Distribución Normal",
      contenido: "Campana de Gauss, simétrica respecto a media μ. Parámetros: media μ y desviación estándar σ. Regla 68-95-99.7: 68% datos en μ±σ, 95% en μ±2σ, 99.7% en μ±3σ. Estandarización: z=(x-μ)/σ. Tabla z para probabilidades. Modela fenómenos naturales: alturas, pesos, errores medición, calificaciones.",
      grado: "11vo-12vo",
      palabras_clave: "distribucion normal,gaussiana,campana gauss,media,desviacion estandar",
      tipo: "expandido"
    },

    // FÍSICA
    {
      materia: "Física - Mecánica",
      tema: "Cinemática MRU",
      contenido: "Movimiento Rectilíneo Uniforme: velocidad constante. Ecuaciones: x = x₀ + vt, v = Δx/Δt. Características: aceleración a=0, gráfica x-t es línea recta, pendiente = velocidad. Ejemplo: auto a 60 km/h recorre 120 km en 2h. Diferencia MRU (v constante) vs MRUV (a constante). Aplicaciones en transporte.",
      grado: "10mo-11vo",
      palabras_clave: "cinematica,MRU,velocidad constante,movimiento uniforme,ecuaciones",
      tipo: "expandido"
    },
    {
      materia: "Física - Mecánica",
      tema: "Leyes de Newton",
      contenido: "1ª Ley (Inercia): objeto en reposo/MRU permanece así sin fuerza neta. 2ª Ley: F=ma (fuerza=masa×aceleración). 3ª Ley (Acción-reacción): toda fuerza tiene reacción igual y opuesta. Unidades: Newton (N) = kg·m/s². Aplicaciones: diseño vehículos, cohetes, deportes. Fundamentales en mecánica clásica.",
      grado: "10mo-11vo",
      palabras_clave: "newton,leyes,fuerza,masa,aceleracion,inercia,mecanica",
      tipo: "expandido"
    },
    {
      materia: "Física - Energía",
      tema: "Trabajo y Energía",
      contenido: "Trabajo: W = F·d·cos(θ), energía transferida por fuerza. Unidad: Joule (J). Energía cinética: Ec = ½mv². Energía potencial gravitatoria: Ep = mgh. Principio conservación: energía total constante en sistema aislado. Ec + Ep = constante. Potencia: P = W/t (Watts). Aplicaciones en máquinas, deportes, centrales eléctricas.",
      grado: "10mo-11vo",
      palabras_clave: "trabajo,energia,cinetica,potencial,conservacion,potencia,joule",
      tipo: "expandido"
    },
    {
      materia: "Física - Electricidad",
      tema: "Ley de Ohm",
      contenido: "Relación voltaje-corriente-resistencia: V = I·R. Voltaje (V) en Volts, Corriente (I) en Amperes, Resistencia (R) en Ohms (Ω). Resistencia depende de material, longitud, área: R=ρL/A. Circuitos serie: R_total = R₁+R₂+..., misma corriente. Paralelo: 1/R_total = 1/R₁+1/R₂+..., mismo voltaje. Potencia eléctrica: P=V·I=I²R=V²/R.",
      grado: "11vo-12vo",
      palabras_clave: "ohm,electricidad,voltaje,corriente,resistencia,circuitos",
      tipo: "expandido"
    },
    {
      materia: "Física - Óptica",
      tema: "Reflexión y Refracción",
      contenido: "Reflexión: ángulo incidencia = ángulo reflexión. Espejos planos: imagen virtual, misma distancia. Refracción: cambio dirección luz al cambiar medio. Ley Snell: n₁sen(θ₁) = n₂sen(θ₂). Índice refracción n=c/v. Reflexión total interna cuando θ>θ_crítico. Aplicaciones: lentes, fibra óptica, prismas, arcoíris.",
      grado: "10mo-11vo",
      palabras_clave: "optica,reflexion,refraccion,luz,snell,espejos,lentes",
      tipo: "expandido"
    },
    {
      materia: "Física - Termodinámica",
      tema: "Leyes de la Termodinámica",
      contenido: "0ª Ley: equilibrio térmico es transitivo. 1ª Ley: conservación energía, ΔU=Q-W (energía interna = calor - trabajo). 2ª Ley: entropía aumenta, calor fluye de caliente a frío naturalmente. 3ª Ley: entropía tiende a 0 en T=0K. Aplicaciones: motores térmicos, refrigeradores, cambios estado. Eficiencia: η=W/Q_entrada<1.",
      grado: "11vo-12vo",
      palabras_clave: "termodinamica,leyes,calor,trabajo,entropia,energia interna",
      tipo: "expandido"
    },

    // QUÍMICA
    {
      materia: "Química - Estructura Atómica",
      tema: "Modelo Atómico Actual",
      contenido: "Átomo: núcleo (protones+, neutrones) y corteza (electrones-). Número atómico Z = protones = electrones (átomo neutro). Número másico A = protones + neutrones. Isótopos: mismo Z, diferente A. Configuración electrónica: distribución electrones en niveles/orbitales (s,p,d,f). Modelo cuántico: orbital = región probabilidad encontrar electrón. Base química moderna.",
      grado: "10mo-11vo",
      palabras_clave: "atomo,protones,neutrones,electrones,configuracion electronica,orbitales",
      tipo: "expandido"
    },
    {
      materia: "Química - Tabla Periódica",
      tema: "Organización y Propiedades",
      contenido: "Elementos ordenados por Z creciente. Periodos (filas): nivel energético externo. Grupos (columnas): propiedades similares, mismos electrones valencia. Metales (izquierda): conductores, maleables, pierden e⁻. No metales (derecha): aislantes, ganan e⁻. Metaloides: propiedades intermedias. Tendencias: radio atómico decrece →, energía ionización crece →. Electronegatividad máxima en F.",
      grado: "9no-10mo",
      palabras_clave: "tabla periodica,elementos,grupos,periodos,metales,no metales,propiedades",
      tipo: "expandido"
    },
    {
      materia: "Química - Enlaces Químicos",
      tema: "Tipos de Enlaces",
      contenido: "Enlace iónico: transferencia e⁻ entre metal-no metal, atracción iones (+/-). Ej: NaCl. Propiedades: alto punto fusión, sólidos cristalinos, conducen disueltos. Enlace covalente: compartir e⁻ entre no metales. Polar (diferente electronegatividad) y apolar (igual). Ej: H₂O polar, O₂ apolar. Enlace metálico: mar electrones en metales. Explica propiedades compuestos.",
      grado: "10mo-11vo",
      palabras_clave: "enlaces,ionico,covalente,metalico,electrones,propiedades",
      tipo: "expandido"
    },
    {
      materia: "Química - Reacciones",
      tema: "Balanceo de Ecuaciones",
      contenido: "Ley conservación masa: átomos no se crean ni destruyen. Ecuación balanceada: igual número cada tipo átomo en reactivos y productos. Métodos: tanteo, algebraico, redox. Coeficientes estequiométricos indican proporción molar. Ejemplo: 2H₂ + O₂ → 2H₂O (2 moles H₂ + 1 mol O₂ = 2 moles H₂O). Estados: (s)sólido, (l)líquido, (g)gas, (aq)acuoso.",
      grado: "10mo-11vo",
      palabras_clave: "reacciones,balanceo,ecuaciones quimicas,estequiometria,conservacion masa",
      tipo: "expandido"
    },
    {
      materia: "Química - Soluciones",
      tema: "Concentración y Dilución",
      contenido: "Solución: mezcla homogénea soluto+solvente. Concentración: cantidad soluto por cantidad solución. Molaridad M = moles soluto / litros solución. %masa = (masa soluto/masa solución)×100. ppm = mg soluto/L solución. Dilución: M₁V₁ = M₂V₂ (moles constantes). Solubilidad: máxima cantidad soluto disuelto a T dada. Factores: temperatura, presión (gases), naturaleza sustancias.",
      grado: "10mo-11vo",
      palabras_clave: "soluciones,concentracion,molaridad,dilucion,solubilidad",
      tipo: "expandido"
    },
    {
      materia: "Química - Ácidos y Bases",
      tema: "pH y Teorías",
      contenido: "Teoría Arrhenius: ácido libera H⁺, base libera OH⁻. Brønsted-Lowry: ácido dona H⁺, base acepta H⁺. pH = -log[H⁺], escala 0-14. pH<7 ácido, pH=7 neutro, pH>7 básico. pOH = -log[OH⁻]. pH + pOH = 14. Indicadores: fenolftaleína, tornasol. Neutralización: ácido + base → sal + agua. Aplicaciones: control calidad, biología, industria.",
      grado: "11vo-12vo",
      palabras_clave: "acidos,bases,pH,neutralizacion,indicadores,arrhenius",
      tipo: "expandido"
    },

    // BIOLOGÍA
    {
      materia: "Biología - Célula",
      tema: "Estructura Celular",
      contenido: "Célula: unidad estructural y funcional vida. Procariota: sin núcleo (bacterias). Eucariota: con núcleo y organelos. Membrana plasmática: bicapa lipídica, permeabilidad selectiva. Núcleo: ADN, control celular. Mitocondria: respiración, ATP. Ribosomas: síntesis proteínas. RE rugoso/liso: transporte. Aparato Golgi: empaquetado. Lisosomas: digestión. Cloroplastos (vegetales): fotosíntesis. Pared celular (vegetales): soporte.",
      grado: "9no-10mo",
      palabras_clave: "celula,organelos,nucleo,mitocondria,membrana,eucariota,procariota",
      tipo: "expandido"
    },
    {
      materia: "Biología - Genética",
      tema: "Leyes de Mendel",
      contenido: "1ª Ley (Uniformidad): F1 híbridos idénticos. 2ª Ley (Segregación): alelos se separan en gametos. 3ª Ley (Independencia): herencia independiente de caracteres diferentes. Conceptos: gen (unidad herencia), alelo (versión gen), genotipo (composición genética), fenotipo (expresión observable). Dominante vs recesivo. Cuadro Punnett para predecir descendencia. Base genética clásica.",
      grado: "10mo-11vo",
      palabras_clave: "genetica,mendel,herencia,alelos,dominante,recesivo,genotipo,fenotipo",
      tipo: "expandido"
    },
    {
      materia: "Biología - Evolución",
      tema: "Teoría de Darwin",
      contenido: "Selección natural: individuos mejor adaptados sobreviven y reproducen más. Variabilidad genética + competencia recursos + herencia = evolución. Evidencias: fósiles, anatomía comparada, embriología, bioquímica, biogeografía. Especiación: formación nuevas especies por aislamiento. Adaptación: características favorables en ambiente específico. No es progreso lineal, es descendencia con modificación. Fundamento biología moderna.",
      grado: "11vo-12vo",
      palabras_clave: "evolucion,darwin,seleccion natural,adaptacion,especiacion,evidencias",
      tipo: "expandido"
    },
    {
      materia: "Biología - Ecología",
      tema: "Ecosistemas",
      contenido: "Ecosistema: comunidad seres vivos + factores abióticos interactuando. Niveles: individuo, población, comunidad, ecosistema, bioma, biosfera. Cadenas alimentarias: productores (plantas) → consumidores primarios (herbívoros) → secundarios (carnívoros) → descomponedores. Pirámides: energía, biomasa, números. Ciclos biogeoquímicos: agua, carbono, nitrógeno, fósforo. Relaciones: competencia, depredación, mutualismo, parasitismo, comensalismo.",
      grado: "9no-10mo",
      palabras_clave: "ecosistemas,cadenas alimentarias,ciclos,relaciones ecologicas,bioma",
      tipo: "expandido"
    },
    {
      materia: "Biología - Anatomía",
      tema: "Sistemas del Cuerpo Humano",
      contenido: "Circulatorio: corazón bombea sangre (O₂, nutrientes). Respiratorio: pulmones, intercambio gaseoso. Digestivo: procesamiento alimentos, nutrientes. Nervioso: cerebro, médula, nervios, control. Endocrino: hormonas, regulación. Muscular: movimiento. Esquelético: soporte, protección. Excretor: riñones eliminan desechos. Inmune: defensa contra patógenos. Reproductivo: continuidad especie. Homeostasis: equilibrio interno.",
      grado: "10mo-11vo",
      palabras_clave: "anatomia,sistemas,cuerpo humano,organos,fisiologia,homeostasis",
      tipo: "expandido"
    },
    {
      materia: "Biología - Fotosíntesis",
      tema: "Proceso y Ecuación",
      contenido: "Plantas convierten luz solar en glucosa. Ecuación: 6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂. Etapas: Fase lumínica (tilacoides): captura luz (clorofila), fotólisis agua, produce ATP y NADPH, libera O₂. Fase oscura/Calvin (estroma): fija CO₂, usa ATP/NADPH, sintetiza glucosa. Factores: luz, CO₂, temperatura, agua. Importancia: base cadenas alimentarias, produce O₂ atmosférico.",
      grado: "10mo-11vo",
      palabras_clave: "fotosintesis,clorofila,glucosa,plantas,luz,CO2,oxigeno",
      tipo: "expandido"
    },

    // LENGUA CASTELLANA
    {
      materia: "Lengua Castellana",
      tema: "Categorías Gramaticales",
      contenido: "Sustantivo: nombra (casa, Juan). Adjetivo: califica (grande, azul). Verbo: acción/estado (correr, ser). Adverbio: modifica verbo/adj/adv (rápidamente, muy, aquí). Pronombre: reemplaza sustantivo (él, esto). Artículo: determina (el, la, un). Preposición: relaciona (a, de, con, para). Conjunción: une (y, pero, porque). Interjección: emoción (¡ay!, ¡bravo!). Base análisis sintáctico y morfológico.",
      grado: "7mo-8vo",
      palabras_clave: "gramatica,categorias,sustantivo,verbo,adjetivo,morfologia,sintaxis",
      tipo: "expandido"
    },
    {
      materia: "Lengua Castellana",
      tema: "Análisis Sintáctico",
      contenido: "Oración: sujeto + predicado. Sujeto: quien realiza acción (núcleo: sustantivo/pronombre). Predicado: qué se dice del sujeto (núcleo: verbo). Complementos: CD (qué/a quién), CI (a/para quién), CC (cómo/cuándo/dónde/por qué), Atributo (con ser/estar), C.Régimen (prep+término). Oraciones simples vs compuestas. Coordinadas (y, pero, o) vs subordinadas (que, si, cuando). Esencial para comprensión y producción textual.",
      grado: "8vo-9no",
      palabras_clave: "sintaxis,oracion,sujeto,predicado,complementos,analisis",
      tipo: "expandido"
    },
    {
      materia: "Lengua Castellana",
      tema: "Géneros Literarios",
      contenido: "Narrativo: cuenta historia (novela, cuento, fábula). Elementos: narrador (1ª/3ª persona), personajes, tiempo, espacio, acción. Lírico: expresa sentimientos (poesía). Elementos: yo lírico, verso, estrofa, rima, figuras literarias. Dramático: representación (teatro). Elementos: diálogo, acotaciones, actos, escenas. Subgéneros: tragedia, comedia, drama. Ensayo: exposición ideas. Cada uno con características y propósitos específicos.",
      grado: "9no-10mo",
      palabras_clave: "generos literarios,narrativo,lirico,dramatico,poesia,teatro,novela",
      tipo: "expandido"
    },
    {
      materia: "Lengua Castellana",
      tema: "Figuras Retóricas",
      contenido: "Metáfora: comparación implícita (sus ojos eran luceros). Símil: comparación explícita (como/cual). Personificación: cualidades humanas a objetos. Hipérbole: exageración (te lo dije mil veces). Aliteración: repetición sonidos. Anáfora: repetición inicio. Antítesis: ideas contrarias. Hipérbaton: orden alterado. Paradoja: aparente contradicción. Enriquecen lenguaje literario, expresividad, belleza estética.",
      grado: "9no-10mo",
      palabras_clave: "figuras retoricas,metafora,simil,lenguaje literario,recursos",
      tipo: "expandido"
    },
    {
      materia: "Lengua Castellana",
      tema: "Coherencia y Cohesión",
      contenido: "Coherencia: unidad significado, relación lógica ideas. Tema central claro, sin contradicciones. Cohesión: conexión gramatical entre partes. Mecanismos: conectores (además, sin embargo, por lo tanto), referentes (pronombres, sinónimos), elipsis (omitir información sobreentendida), campo semántico. Texto bien estructurado: introducción, desarrollo, conclusión. Párrafos con idea principal. Esencial escritura efectiva.",
      grado: "10mo-11vo",
      palabras_clave: "coherencia,cohesion,texto,conectores,escritura,redaccion",
      tipo: "expandido"
    },
    {
      materia: "Lengua Castellana",
      tema: "Ortografía y Acentuación",
      contenido: "Sílaba tónica: más fuerte. Agudas: última (café), tilde si termina n/s/vocal. Graves: penúltima (árbol), tilde si NO termina n/s/vocal. Esdrújulas: antepenúltima, SIEMPRE tilde (médico). Sobresdrújulas: antes antepenúltima, SIEMPRE (dígamelo). Diacríticos: diferencian palabras (té/te, sí/si). Diptongo: 2 vocales juntas. Hiato: 2 vocales separadas. B/V, G/J, H, LL/Y. Puntuación: coma, punto, punto y coma, dos puntos.",
      grado: "7mo-9no",
      palabras_clave: "ortografia,acentuacion,tildes,agudas,graves,esdrujulas,puntuacion",
      tipo: "expandido"
    },

    // INGLÉS
    {
      materia: "Inglés",
      tema: "Present Simple vs Present Continuous",
      contenido: "Present Simple: acciones habituales, verdades generales. Forma: I/you/we/they + verb, he/she/it + verb+s. Ejemplo: She works every day. Negativo: don't/doesn't + verb. Pregunta: Do/Does + subject + verb? Present Continuous: acciones en progreso ahora. Forma: am/is/are + verb+ing. Ejemplo: She is working now. Uso: momento actual, planes futuros. Adverbios: always, usually (simple), now, currently (continuous).",
      grado: "8vo-9no",
      palabras_clave: "present simple,present continuous,verb tenses,grammar,ingles",
      tipo: "expandido"
    },
    {
      materia: "Inglés",
      tema: "Past Tenses",
      contenido: "Past Simple: acciones completadas pasado. Regular: verb+ed (walked). Irregular: memorizar (go→went, see→saw). Ejemplo: I visited Paris last year. Negativo: didn't + verb. Pregunta: Did + subject + verb? Past Continuous: acción progreso en momento pasado. Forma: was/were + verb+ing. Ejemplo: I was studying at 8pm. Uso: acciones interrumpidas (I was reading when he called), simultáneas. Expresiones: yesterday, ago, last week.",
      grado: "9no-10mo",
      palabras_clave: "past simple,past continuous,irregular verbs,past tense,grammar",
      tipo: "expandido"
    },
    {
      materia: "Inglés",
      tema: "Modal Verbs",
      contenido: "Verbos modales expresan posibilidad, obligación, habilidad. Can: habilidad, permiso (I can swim). Could: pasado can, posibilidad (Could you help?). May/Might: posibilidad (It may rain). Must: obligación fuerte (You must study). Have to: obligación externa (I have to work). Should: consejo (You should rest). Would: condicional, cortesía (I would like...). Características: + infinitivo sin to, no conjugan, mismo todas personas.",
      grado: "10mo-11vo",
      palabras_clave: "modal verbs,can,must,should,could,would,grammar,obligation",
      tipo: "expandido"
    },
    {
      materia: "Inglés",
      tema: "Conditionals",
      contenido: "Zero: verdades generales. If + present simple, present simple. (If you heat water, it boils). First: situaciones reales futuro. If + present simple, will + infinitive. (If it rains, I will stay home). Second: situaciones hipotéticas presente. If + past simple, would + infinitive. (If I had money, I would travel). Third: situaciones hipotéticas pasado. If + past perfect, would have + past participle. (If I had studied, I would have passed).",
      grado: "11vo-12vo",
      palabras_clave: "conditionals,if clauses,grammar,zero first second third conditional",
      tipo: "expandido"
    },
    {
      materia: "Inglés",
      tema: "Vocabulary Building",
      contenido: "Estrategias: contexto, cognados (similar español), prefijos/sufijos (un-, re-, -tion, -ly), campos semánticos (agrupación temas), sinónimos/antónimos. Word formation: happy→happiness, use→useful→useless. Phrasal verbs: look after, give up, turn on. Idioms: piece of cake, break a leg. False friends: actual≠actual(real), embarazada≠embarrassed(avergonzado). Lectura extensiva, flashcards, práctica contextualizada.",
      grado: "9no-11vo",
      palabras_clave: "vocabulary,words,idioms,phrasal verbs,prefixes,suffixes,english",
      tipo: "expandido"
    }
  ];

  // Insertar conocimiento expandido por lotes
  const batchSize = 50;
  for (let i = 0; i < expandedKnowledge.length; i += batchSize) {
    const batch = expandedKnowledge.slice(i, i + batchSize);
    const entries = batch.map(entry => ({
      id: crypto.randomUUID(),
      materia: entry.materia,
      tema: entry.tema,
      contenido: entry.contenido,
      grado: entry.grado,
      palabras_clave: entry.palabras_clave,
      fecha_agregado: Date.now(),
      tipo: entry.tipo
    }));
    
    // await db.insertInto("conocimientoIA").values(entries).execute();
    console.log(`Insertadas ${entries.length} entradas (lote ${Math.floor(i/batchSize) + 1})`);
  }
  
  console.log(`✅ Base de conocimientos expandida: ${expandedKnowledge.length} entradas agregadas`);
}

// Obtener todo el conocimiento
router.get("/api/knowledge", async (req, res) => {
  try {
    const knowledge = // await db.selectFrom("conocimientoIA").selectAll().execute();
    res.json(knowledge);
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    res.status(500).json({ error: "Failed to fetch knowledge" });
  }
  return;
});

// Agregar nuevo conocimiento
router.post("/api/knowledge", async (req, res) => {
  try {
    const { materia, tema, contenido, grado, palabras_clave, tipo } = req.body;
    
    const newKnowledge = {
      id: crypto.randomUUID(),
      materia,
      tema,
      contenido,
      grado,
      palabras_clave,
      fecha_agregado: Date.now(),
      tipo: tipo || "manual"
    };

    // await db.insertInto("conocimientoIA").values(newKnowledge).execute();
    res.json(newKnowledge);
  } catch (error) {
    console.error("Error adding knowledge:", error);
    res.status(500).json({ error: "Failed to add knowledge" });
  }
  return;
});

// Agregar conocimiento masivo
router.post("/api/knowledge/bulk", async (req, res) => {
  try {
    const { entries } = req.body;
    
    const knowledgeEntries = entries.map((entry: any) => ({
      id: crypto.randomUUID(),
      materia: entry.materia,
      tema: entry.tema,
      contenido: entry.contenido,
      grado: entry.grado,
      palabras_clave: entry.palabras_clave,
      fecha_agregado: Date.now(),
      tipo: entry.tipo || "manual"
    }));

    // await db.insertInto("conocimientoIA").values(knowledgeEntries).execute();
    res.json({ success: true, count: knowledgeEntries.length });
  } catch (error) {
    console.error("Error adding bulk knowledge:", error);
    res.status(500).json({ error: "Failed to add bulk knowledge" });
  }
  return;
});

// Eliminar conocimiento
router.delete("/api/knowledge/:id", async (req, res) => {
  try {
    // await db.deleteFrom("conocimientoIA").where("id", "=", req.params.id).execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    res.status(500).json({ error: "Failed to delete knowledge" });
  }
  return;
});

// Obtener todas las sesiones de chat
router.get("/api/chat/sessions", async (req, res) => {
  try {
    const sessions = // await db
      .selectFrom("chat_sessions")
      .selectAll()
      .orderBy("updated_at", "desc")
      .execute();
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
  return;
});

// Obtener mensajes de una sesión
router.get("/api/chat/sessions/:id/messages", async (req, res) => {
  try {
    const messages = // await db
      .selectFrom("chat_messages")
      .selectAll()
      .where("session_id", "=", req.params.id)
      .orderBy("timestamp", "asc")
      .execute();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching session messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
  return;
});

// Eliminar sesión de chat
router.delete("/api/chat/sessions/:id", async (req, res) => {
  try {
    // await db.deleteFrom("chat_messages").where("session_id", "=", req.params.id).execute();
    // await db.deleteFrom("chat_sessions").where("id", "=", req.params.id).execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
  return;
});

// Endpoint para generar imágenes con Gemini
router.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, relatedTopic } = req.body;
    
    console.log("Generando imagen con prompt:", prompt);
    
    // Verificar conectividad a Internet
    const isOnline = await checkInternetConnection();
    
    if (!isOnline) {
      res.status(503).json({ error: "Se requiere conexión a Internet para generar imágenes" });
      return;
    }
    
    // Usar Gemini para mejorar el prompt y generar una imagen educativa
    const enhancedPromptResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crea un prompt detallado en inglés para generar una imagen educativa sobre: "${prompt}". El prompt debe ser descriptivo, claro y apropiado para un contexto académico. Devuelve SOLO el prompt mejorado, sin explicaciones adicionales.`
            }]
          }]
        })
      }
    );
    
    if (!enhancedPromptResponse.ok) {
      res.status(500).json({ error: "Error al procesar el prompt" });
      return;
    }
    
    const enhancedData = await enhancedPromptResponse.json();
    const enhancedPrompt = enhancedData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    
    console.log("Prompt mejorado:", enhancedPrompt);
    
    // Generar una imagen SVG educativa simple como placeholder
    // En producción, aquí se integraría con un servicio de generación de imágenes real
    const svgImage = generateEducationalSVG(prompt, relatedTopic);
    const base64Image = Buffer.from(svgImage).toString("base64");
    const imageData = `data:image/svg+xml;base64,${base64Image}`;
    
    const generatedImage = {
      id: crypto.randomUUID(),
      prompt: enhancedPrompt,
      image_data: imageData,
      created_at: Date.now(),
      related_topic: relatedTopic || null,
      size: "1024x1024"
    };
    
    // Guardar en la base de datos
    // await db.insertInto("generated_images").values(generatedImage).execute();
    
    res.json({ 
      success: true, 
      imageId: generatedImage.id,
      imageData: generatedImage.image_data,
      enhancedPrompt: enhancedPrompt
    });
  } catch (error) {
    console.error("Error generando imagen:", error);
    res.status(500).json({ error: "Error en la generación de imagen" });
  }
  return;
});

// Función para generar SVG educativo
function generateEducationalSVG(topic: string, relatedTopic?: string): string {
  const colors = ["#4F46E5", "#7C3AED", "#EC4899", "#10B981", "#F59E0B"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad1)"/>
      <circle cx="512" cy="300" r="150" fill="white" opacity="0.2"/>
      <circle cx="300" cy="600" r="100" fill="white" opacity="0.15"/>
      <circle cx="750" cy="650" r="120" fill="white" opacity="0.18"/>
      <text x="512" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            fill="white" text-anchor="middle">${topic.substring(0, 30)}</text>
      <text x="512" y="540" font-family="Arial, sans-serif" font-size="24" 
            fill="white" opacity="0.9" text-anchor="middle">${relatedTopic ? relatedTopic.substring(0, 40) : "Imagen educativa"}</text>
      <path d="M 412 600 L 512 650 L 612 600 L 612 700 L 512 750 L 412 700 Z" 
            fill="white" opacity="0.3" stroke="white" stroke-width="2"/>
      <circle cx="512" cy="650" r="15" fill="white"/>
      <text x="512" y="850" font-family="Arial, sans-serif" font-size="18" 
            fill="white" opacity="0.7" text-anchor="middle">Generado por ValeAI</text>
    </svg>
  `;
}

// Obtener imágenes generadas
router.get("/api/generated-images", async (req, res) => {
  try {
    const images = // await db
      .selectFrom("generated_images")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(50)
      .execute();
    res.json(images);
  } catch (error) {
    console.error("Error fetching generated images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
  return;
});



// Chat con la IA usando Gemini 2.5 (con detección online/offline)
router.post("/api/chat", async (req, res) => {
  try {
    const { message, imageUrl, sessionId } = req.body;
    
    let currentSessionId = sessionId;
    
    // Detectar saludos y conversación casual
    const saludos = ["hola", "hello", "hi", "hey", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás"];
    const despedidas = ["adiós", "chao", "hasta luego", "nos vemos", "bye", "hasta pronto"];
    const agradecimientos = ["gracias", "thank you", "te agradezco", "muchas gracias"];
    
    const mensajeLower = message.toLowerCase().trim();
    
    // Respuestas con personalidad
    if (saludos.some(s => mensajeLower.includes(s))) {
      const respuestaSaludo = [
        "¡Hola! 😊 Soy ValeAI, tu asistente académico. ¿En qué puedo ayudarte hoy?",
        "¡Hola! Me alegra verte por aquí. ¿Qué tema te gustaría explorar?",
        "¡Hey! 👋 Estoy lista para ayudarte con cualquier duda académica que tengas.",
        "¡Hola! ¿Listo para aprender algo nuevo hoy? Cuéntame qué necesitas."
      ];
      const respuesta = respuestaSaludo[Math.floor(Math.random() * respuestaSaludo.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
    if (despedidas.some(d => mensajeLower.includes(d))) {
      const respuestaDespedida = [
        "¡Hasta luego! Fue un placer ayudarte. Vuelve cuando necesites más apoyo. 📚",
        "¡Nos vemos! Espero haberte ayudado. Aquí estaré cuando me necesites. ✨",
        "¡Adiós! Sigue aprendiendo y explorando. ¡Éxito en tus estudios! 🚀"
      ];
      const respuesta = respuestaDespedida[Math.floor(Math.random() * respuestaDespedida.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
    if (agradecimientos.some(a => mensajeLower.includes(a))) {
      const respuestaGracias = [
        "¡De nada! Para eso estoy aquí. 😊 ¿Necesitas ayuda con algo más?",
        "¡Con gusto! Me encanta poder ayudarte. ¿Qué más puedo hacer por ti?",
        "¡No hay de qué! Siempre es un placer asistirte en tu aprendizaje. 💡"
      ];
      const respuesta = respuestaGracias[Math.floor(Math.random() * respuestaGracias.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
    // Buscar conocimiento relevante en la base de datos local
    const knowledge = // await db
      .selectFrom("conocimientoIA")
      .selectAll()
      .execute();
    
    // Construir contexto desde el conocimiento local
    const localContext = knowledge
      .map(k => `${k.materia} - ${k.tema}: ${k.contenido}`)
      .join("\n");
    
    // Verificar si hay Internet disponible
    const isOnline = await checkInternetConnection();
    
    // Usar Gemini 2.5 Flash para generar respuesta (solo si hay Internet)
    let aiResponse = "";
    try {
      if (!isOnline) {
        throw new Error("Sin conexión a Internet - usando modo offline");
      }
      
      const personalidadPrompt = `Eres ValeAI, una asistente académica amigable, entusiasta y motivadora. Tu objetivo es ayudar a estudiantes a aprender de forma clara y comprensible. 

Características de tu personalidad:
- Amable y cercana, como una amiga que ayuda a estudiar
- Usa emojis ocasionalmente para ser más expresiva (pero sin exagerar)
- Explica conceptos de forma simple antes de profundizar
- Motiva al estudiante con frases positivas
- Si no sabes algo, lo admites con honestidad y ofreces alternativas
- Haces preguntas para asegurarte de que el estudiante entendió

Contexto de conocimiento disponible:
${localContext}

Pregunta del usuario: ${message}

Responde de forma clara, educativa y con tu personalidad característica en español.`;

      const geminiPayload: any = {
        contents: [{
          parts: [{
            text: personalidadPrompt
          }]
        }]
      };

      // Si hay imagen, agregarla al contexto
      if (imageUrl) {
        geminiPayload.contents[0].parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageUrl.split(",")[1] // Remover el prefijo data:image
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload)
        }
      );

      const data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Hmm, parece que tuve un pequeño problema procesando eso. ¿Podrías intentar preguntármelo de otra forma? 🤔";
    } catch (geminiError) {
      console.error("Error llamando a Gemini (modo offline activado):", geminiError);
      
      // MODO OFFLINE - Buscar en conocimiento local
      const searchTerms = message.toLowerCase().split(" ");
      const relevantKnowledge = knowledge.filter(k => 
        searchTerms.some(term => 
          k.materia.toLowerCase().includes(term) ||
          k.tema.toLowerCase().includes(term) ||
          k.contenido.toLowerCase().includes(term) ||
          k.palabras_clave.toLowerCase().includes(term)
        )
      );
      
      if (relevantKnowledge.length > 0) {
        // Construir respuesta desde base de conocimiento local
        const topResults = relevantKnowledge.slice(0, 3);
        aiResponse = `📚 **Modo Offline Activado**\n\nEncontré información relevante en mi base de conocimiento:\n\n`;
        
        topResults.forEach((k, idx) => {
          aiResponse += `**${idx + 1}. ${k.tema}** (${k.materia})\n${k.contenido}\n\n`;
        });
        
        aiResponse += `💡 *Nota: Estoy trabajando en modo offline usando mi conocimiento integrado. Para respuestas más detalladas, conecta a Internet.*`;
      } else {
        aiResponse = `🔌 **Modo Offline**\n\nNo encontré información específica sobre "${message}" en mi base de conocimiento local.\n\nPuedes:\n• Conectarte a Internet para obtener información actualizada\n• Agregar este contenido manualmente en el Gestor de Conocimiento\n• Reformular tu pregunta con términos más generales\n\n💪 Estoy aquí para ayudarte cuando tengas conexión.`;
      }
    }
    
    // Guardar en sesión de chat
    if (!currentSessionId) {
      // Crear nueva sesión
      currentSessionId = crypto.randomUUID();
      const sessionTitle = message.length > 50 ? message.substring(0, 50) + "..." : message;
      
      // await db.insertInto("chat_sessions").values({
        id: currentSessionId,
        title: sessionTitle,
        created_at: Date.now(),
        updated_at: Date.now(),
        message_count: 2
      }).execute();
    } else {
      // Actualizar sesión existente
      const session = // await db
        .selectFrom("chat_sessions")
        .select("message_count")
        .where("id", "=", currentSessionId)
        .executeTakeFirst();
      
      // await db
        .updateTable("chat_sessions")
        .set({
          updated_at: Date.now(),
          message_count: (session?.message_count || 0) + 2
        })
        .where("id", "=", currentSessionId)
        .execute();
    }
    
    // Guardar mensajes
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    
    // await db.insertInto("chat_messages").values({
      id: userMessageId,
      session_id: currentSessionId,
      type: "user",
      content: message,
      image_url: imageUrl || null,
      timestamp: Date.now()
    }).execute();
    
    // await db.insertInto("chat_messages").values({
      id: assistantMessageId,
      session_id: currentSessionId,
      type: "assistant",
      content: aiResponse,
      image_url: null,
      timestamp: Date.now()
    }).execute();
    
    // Guardar la conversación para que la IA aprenda
    const conversation = {
      id: crypto.randomUUID(),
      pregunta: message,
      respuesta: aiResponse,
      contexto: localContext,
      imagen_url: imageUrl || null,
      fecha: Date.now(),
      util: 1
    };
    
    // await db.insertInto("conversaciones").values(conversation).execute();
    
    res.json({ response: aiResponse, conversationId: conversation.id, sessionId: currentSessionId });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
  return;
});

// Marcar conversación como útil/no útil (para aprendizaje)
router.patch("/api/chat/:id/feedback", async (req, res) => {
  try {
    const { util } = req.body;
    // await db
      .updateTable("conversaciones")
      .set({ util })
      .where("id", "=", req.params.id)
      .execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
  return;
});

// Configurar Multer para uploads con límite aumentado
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB máximo para archivos grandes
});



// Procesar archivo con sistema hiper-rápido optimizado
router.post("/api/process-file", upload.single("file"), async (req: any, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.file;
    console.log(`⚡ Iniciando procesamiento hiper-rápido: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`);
    
    // Paso 1: Extracción ultra-rápida de contenido
    const extractedContent = await processIndividualFile(file.buffer, file.originalname);
    console.log(`✓ Contenido extraído: ${extractedContent.length} caracteres`);

    // Paso 2: Análisis con Gemini (solo si hay internet)
    const analysis = await analyzeContentWithGemini(extractedContent);
    console.log(`✓ Análisis completado: ${analysis.topics.length} temas, ${analysis.categories.length} categorías`);

    // Paso 3: Guardado optimizado en base de datos
    const processedFile = await saveProcessedFile(file, extractedContent, analysis);
    
    const totalTime = Date.now() - startTime;
    console.log(`🚀 Procesamiento COMPLETO: ${file.originalname} en ${totalTime}ms - ${analysis.topics.length} temas aprendidos`);
    
    res.json({ 
      success: true, 
      fileId: processedFile.id,
      learnedTopics: analysis.topics.length,
      categories: analysis.categories.length,
      processingTime: totalTime
    });
  } catch (error) {
    console.error("Error en procesamiento rápido:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
  return;
});

// Obtener archivos procesados
router.get("/api/processed-files", async (req, res) => {
  try {
    const files = // await db
      .selectFrom("processed_files")
      .selectAll()
      .orderBy("processing_date", "desc")
      .execute();
    res.json(files);
  } catch (error) {
    console.error("Error fetching processed files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
  return;
});

// Obtener estadísticas de aprendizaje
router.get("/api/learning-stats", async (req, res) => {
  try {
    const filesCount = // await db
      .selectFrom("processed_files")
      .select(db.fn.count("id").as("count"))
      .executeTakeFirst();

    const topicsCount = // await db
      .selectFrom("learning_progress")
      .select(db.fn.count("id").as("count"))
      .executeTakeFirst();

    const avgProficiency = // await db
      .selectFrom("learning_progress")
      .select(db.fn.avg("proficiency_level").as("avg"))
      .executeTakeFirst();

    const knowledgeCount = // await db
      .selectFrom("conocimientoIA")
      .select(db.fn.count("id").as("count"))
      .executeTakeFirst();

    res.json({
      totalFiles: Number(filesCount?.count || 0),
      topicsLearned: Number(topicsCount?.count || 0),
      avgProficiency: Math.round(Number(avgProficiency?.avg || 0)),
      totalKnowledge: Number(knowledgeCount?.count || 0)
    });
  } catch (error) {
    console.error("Error fetching learning stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
  return;
});

export default router;
