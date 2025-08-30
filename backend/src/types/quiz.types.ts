export interface currentQuiz {
  quiz_id: number;
  title: string;
  available_from: Date | string;
  available_until: Date | string;
  difficulty_level: string;
  date: Date | string;
  created_at: Date | string;
  pdf_url: string;
  status: string;
}

export interface QuizSubmitAnswer {
  answer_id?: number;
  user_id: number;
  quiz_id: number;
  question_number: 1 | 2 | 3 | 4 | 5;
  attempt_number: 1 | 2;
  answer: string;
  is_correct: boolean;
  score: 0 | 5 | 10;
  answered_at?: string | Date;
}

export interface QuizCorrectAnswer {
  quiz_id: number;
  question_number: 1 | 2 | 3 | 4 | 5;
  correct_answer: string;
}
