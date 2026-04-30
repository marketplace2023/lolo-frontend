import { api } from "@/services/api";

export type MarketplaceOfferType = "product" | "service";
export type MarketplaceOfferSource = "listing";

export interface IMarketplaceOffer {
  id: string;
  sourceId: string;
  sourceType: MarketplaceOfferSource;
  title: string;
  description: string;
  sku: string;
  category: string;
  type: MarketplaceOfferType;
  seller: string;
  sellerId: string | null;
  sellerRating: number;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  stock: number | null;
  unit: string | null;
  location: string | null;
  image: string | null;
  images: string[];
}

export interface ICreateMarketplaceOfferPayload {
  title: string;
  category: string;
  type: MarketplaceOfferType;
  description: string;
  price: number;
  currency: string;
  stock: number | null;
  sku: string | null;
  images: string[];
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data as { url: string; fileName: string; size: number; type: string };
}

export interface IMarketplaceContractor {
  id: string;
  nombre: string;
  rif: string | null;
  direccion?: string | null;
  logo: string | null;
  portada?: string | null;
  galeria?: string[] | null;
  descripcionPublica: string | null;
  especialidades: string[] | null;
  estadoUbicacion: string | null;
  anosFundacion: number | null;
  telefono: string | null;
  email: string | null;
  sitioWeb?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  horarioAtencion?: string | null;
  coberturaServicio?: string | null;
  rating: string | number | null;
  totalProyectos: number | null;
  rncContratista: string | null;
}

export interface IMarketplaceContractorProfile extends IMarketplaceContractor {
  isPublic: boolean;
  listings: IMarketplaceOffer[];
}

export interface IMarketplaceReview {
  id: string;
  productId: string;
  productTitle: string;
  author: string;
  avatar: string | null;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  responded: boolean;
}

export interface IMarketplaceReviewSummary {
  averageRating: number;
  total: number;
  positive: number;
  breakdown: Array<{ star: number; count: number }>;
}

export async function getMarketplaceOffers(params?: {
  featured?: boolean;
  limit?: number;
  search?: string;
  type?: MarketplaceOfferType;
  category?: string;
}) {
  const response = await api.get("/marketplace/offers", { params });
  return response.data as { data: IMarketplaceOffer[]; total: number };
}

export async function getMarketplaceOffer(id: string) {
  const response = await api.get(`/marketplace/offers/${id}`);
  return response.data as IMarketplaceOffer;
}

export async function createMarketplaceOffer(payload: ICreateMarketplaceOfferPayload) {
  const response = await api.post("/marketplace/offers", payload);
  return response.data as IMarketplaceOffer;
}

export async function getMyMarketplaceOffers() {
  const response = await api.get("/marketplace/offers/my");
  return response.data as { data: IMarketplaceOffer[] };
}

export async function getMarketplaceContractors(params?: {
  search?: string;
  especialidad?: string;
  estado?: string;
}) {
  const response = await api.get("/marketplace/contractors", { params });
  return response.data as { data: IMarketplaceContractor[]; total: number };
}

export async function getMarketplaceContractor(id: string) {
  const response = await api.get(`/marketplace/contractors/${id}`);
  return response.data as IMarketplaceContractorProfile;
}

export async function getMyMarketplaceReviews() {
  const response = await api.get("/marketplace/reviews/my");
  return response.data as {
    data: IMarketplaceReview[];
    summary: IMarketplaceReviewSummary;
  };
}
