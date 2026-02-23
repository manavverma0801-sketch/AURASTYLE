export type Occasion = 'Casual' | 'Business' | 'Wedding' | 'Date Night' | 'Party' | 'Formal Event' | 'Outdoor Adventure';
export type Weather = 'Sunny' | 'Rainy' | 'Cold' | 'Hot' | 'Windy' | 'Snowy';

export interface Recommendation {
  outfit: string;
  footwear: string;
  accessories: string;
  stylingTips: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
