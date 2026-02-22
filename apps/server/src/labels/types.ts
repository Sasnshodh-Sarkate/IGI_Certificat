export interface StockLabelData {
    stock_id: string;
    weight: number | string;
    total_sold_weight?: number | string;
    no_of_stones: number | string;
    total_sold_stones?: number | string;
    lab: string;
    cut: string;
    polish: string;
    symmetry: string;
    fluorescence: string;
    shape: string;
    color: string;
    clarity: string;
    no_bgm: string;
    type?: string;
    cert_number?: string;
    measurement?: string;
}
