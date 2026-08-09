export interface DepthLevel {
  price: number;
  quantity: number;
  cumulative: number;
}

export interface OrderbookSnapshot {
  bids: DepthLevel[];
  asks: DepthLevel[];
  timestamp: number;
}
