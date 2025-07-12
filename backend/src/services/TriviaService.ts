import { TriviaQuestion, OpenTriviaResponse, OpenTriviaQuestion } from '../types/game';

export class TriviaService {
  private static readonly API_BASE_URL = 'https://opentdb.com/api.php';
  private static readonly QUESTION_TIME_LIMIT = 30; // 30 segundos por pregunta
  
  /**
   * Obtiene preguntas de trivia de la API de Open Trivia DB
   * @param amount Número de preguntas a obtener (máximo 50)
   * @param difficulty Dificultad de las preguntas
   * @returns Array de preguntas de trivia
   */
  static async getQuestions(amount: number = 10, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<TriviaQuestion[]> {
    try {
      const url = `${this.API_BASE_URL}?amount=${amount}&difficulty=${difficulty}&type=multiple&encode=url3986`;
      
      console.log(`🎯 Obteniendo ${amount} preguntas de trivia (${difficulty}) desde Open Trivia DB`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json() as OpenTriviaResponse;
      
      if (data.response_code !== 0) {
        throw new Error(`Error de API: ${this.getErrorMessage(data.response_code)}`);
      }
      
      console.log(`✅ Obtenidas ${data.results.length} preguntas de trivia`);
      
      return data.results.map(this.transformQuestion);
    } catch (error) {
      console.error('❌ Error obteniendo preguntas de trivia:', error);
      
      // Fallback con preguntas predefinidas en español
      return this.getFallbackQuestions(amount);
    }
  }
  
  /**
   * Transforma una pregunta de la API al formato interno
   */
  private static transformQuestion(apiQuestion: OpenTriviaQuestion): TriviaQuestion {
    // Decodificar URL encoding
    const question = decodeURIComponent(apiQuestion.question);
    const correctAnswer = decodeURIComponent(apiQuestion.correct_answer);
    const incorrectAnswers = apiQuestion.incorrect_answers.map(answer => decodeURIComponent(answer));
    
    // Mezclar respuestas correctas e incorrectas
    const allAnswers = [correctAnswer, ...incorrectAnswers];
    const shuffledOptions = this.shuffleArray(allAnswers);
    
    return {
      id: `trivia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      options: shuffledOptions,
      correctAnswer,
      category: this.translateCategory(apiQuestion.category),
      difficulty: apiQuestion.difficulty,
      timeLimit: this.QUESTION_TIME_LIMIT
    };
  }
  
  /**
   * Mezcla un array usando el algoritmo Fisher-Yates
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Traduce las categorías de inglés a español
   */
  private static translateCategory(category: string): string {
    const translations: { [key: string]: string } = {
      'General Knowledge': 'Conocimiento General',
      'Entertainment: Books': 'Entretenimiento: Libros',
      'Entertainment: Film': 'Entretenimiento: Cine',
      'Entertainment: Music': 'Entretenimiento: Música',
      'Entertainment: Musicals & Theatres': 'Entretenimiento: Musicales y Teatro',
      'Entertainment: Television': 'Entretenimiento: Televisión',
      'Entertainment: Video Games': 'Entretenimiento: Videojuegos',
      'Entertainment: Board Games': 'Entretenimiento: Juegos de Mesa',
      'Science & Nature': 'Ciencia y Naturaleza',
      'Science: Computers': 'Ciencia: Computadoras',
      'Science: Mathematics': 'Ciencia: Matemáticas',
      'Mythology': 'Mitología',
      'Sports': 'Deportes',
      'Geography': 'Geografía',
      'History': 'Historia',
      'Politics': 'Política',
      'Art': 'Arte',
      'Celebrities': 'Celebridades',
      'Animals': 'Animales',
      'Vehicles': 'Vehículos',
      'Entertainment: Comics': 'Entretenimiento: Cómics',
      'Science: Gadgets': 'Ciencia: Gadgets',
      'Entertainment: Japanese Anime & Manga': 'Entretenimiento: Anime y Manga',
      'Entertainment: Cartoon & Animations': 'Entretenimiento: Dibujos Animados'
    };
    
    return translations[category] || category;
  }
  
  /**
   * Obtiene el mensaje de error basado en el código de respuesta de la API
   */
  private static getErrorMessage(code: number): string {
    const errorMessages: { [key: number]: string } = {
      1: 'No hay suficientes preguntas para la consulta especificada',
      2: 'Contiene un parámetro inválido',
      3: 'Token de sesión no encontrado',
      4: 'Token de sesión ha devuelto todas las preguntas posibles'
    };
    
    return errorMessages[code] || `Error desconocido (código: ${code})`;
  }
  
  /**
   * Preguntas de respaldo en español cuando falla la API
   */
  private static getFallbackQuestions(amount: number): TriviaQuestion[] {
    const fallbackQuestions: TriviaQuestion[] = [
      {
        id: 'fallback_1',
        question: '¿Cuál es la capital de España?',
        options: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
        correctAnswer: 'Madrid',
        category: 'Geografía',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_2',
        question: '¿En qué año llegó el hombre a la luna?',
        options: ['1969', '1968', '1970', '1971'],
        correctAnswer: '1969',
        category: 'Historia',
        difficulty: 'medium',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_3',
        question: '¿Cuál es el planeta más grande del sistema solar?',
        options: ['Júpiter', 'Saturno', 'Neptuno', 'Urano'],
        correctAnswer: 'Júpiter',
        category: 'Ciencia y Naturaleza',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_4',
        question: '¿Quién escribió "Don Quijote de la Mancha"?',
        options: ['Miguel de Cervantes', 'Federico García Lorca', 'Antonio Machado', 'Gustavo Adolfo Bécquer'],
        correctAnswer: 'Miguel de Cervantes',
        category: 'Literatura',
        difficulty: 'medium',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_5',
        question: '¿Cuál es el océano más grande del mundo?',
        options: ['Océano Pacífico', 'Océano Atlántico', 'Océano Índico', 'Océano Ártico'],
        correctAnswer: 'Océano Pacífico',
        category: 'Geografía',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_6',
        question: '¿Cuántos continentes hay en el mundo?',
        options: ['7', '6', '5', '8'],
        correctAnswer: '7',
        category: 'Geografía',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_7',
        question: '¿Cuál es la fórmula química del agua?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 'H2O',
        category: 'Ciencia y Naturaleza',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_8',
        question: '¿En qué año se descubrió América?',
        options: ['1492', '1491', '1493', '1490'],
        correctAnswer: '1492',
        category: 'Historia',
        difficulty: 'medium',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_9',
        question: '¿Cuál es el metal más abundante en la corteza terrestre?',
        options: ['Aluminio', 'Hierro', 'Cobre', 'Oro'],
        correctAnswer: 'Aluminio',
        category: 'Ciencia y Naturaleza',
        difficulty: 'hard',
        timeLimit: this.QUESTION_TIME_LIMIT
      },
      {
        id: 'fallback_10',
        question: '¿Cuál es la montaña más alta del mundo?',
        options: ['Monte Everest', 'K2', 'Kangchenjunga', 'Lhotse'],
        correctAnswer: 'Monte Everest',
        category: 'Geografía',
        difficulty: 'easy',
        timeLimit: this.QUESTION_TIME_LIMIT
      }
    ];
    
    // Mezclar y devolver la cantidad solicitada
    const shuffled = this.shuffleArray(fallbackQuestions);
    return shuffled.slice(0, Math.min(amount, shuffled.length));
  }
  
  /**
   * Calcula el puntaje basado en si la respuesta es correcta y el tiempo usado
   */
  static calculateScore(isCorrect: boolean, timeUsed: number, timeLimit: number): number {
    if (!isCorrect) return 0;
    
    // Puntaje base de 100 puntos por respuesta correcta
    const baseScore = 100;
    
    // Bonus por velocidad: máximo 50 puntos adicionales
    const timeBonus = Math.max(0, Math.floor(((timeLimit - timeUsed) / timeLimit) * 50));
    
    return baseScore + timeBonus;
  }
} 