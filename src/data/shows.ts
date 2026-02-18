export interface StreamingProvider {
  name: string;
  logo: string | null;
}

export interface Show {
  id: string;
  title: string;
  genre: string[];
  year: number;
  rating: number;
  description: string;
  poster: string;
  platform: string;
  providers?: StreamingProvider[];
}

export const sampleShows: Show[] = [
  {
    id: "1",
    title: "Stranger Things",
    genre: ["Sci-Fi", "Horror", "Drama"],
    year: 2016,
    rating: 8.7,
    description: "When a young boy disappears, his mother and friends must confront terrifying supernatural forces to get him back.",
    poster: "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    platform: "Netflix",
  },
  {
    id: "2",
    title: "Ted Lasso",
    genre: ["Comedy", "Drama", "Sport"],
    year: 2020,
    rating: 8.8,
    description: "An American college football coach is hired to manage an English soccer team despite having no experience.",
    poster: "https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
    platform: "Apple TV+",
  },
  {
    id: "3",
    title: "The Bear",
    genre: ["Comedy", "Drama"],
    year: 2022,
    rating: 8.6,
    description: "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.",
    poster: "https://image.tmdb.org/t/p/w500/sHFlZezHGvTHHbqnhlNMPuVMFY4.jpg",
    platform: "Hulu",
  },
  {
    id: "4",
    title: "Severance",
    genre: ["Sci-Fi", "Thriller", "Drama"],
    year: 2022,
    rating: 8.7,
    description: "Employees of a company undergo a procedure that separates their work and personal memories.",
    poster: "https://image.tmdb.org/t/p/w500/lFf6LLrQjYFKnFdCux9UISsOMHb.jpg",
    platform: "Apple TV+",
  },
  {
    id: "5",
    title: "Fleabag",
    genre: ["Comedy", "Drama"],
    year: 2016,
    rating: 8.7,
    description: "A dry-witted woman navigates life in London while trying to cope with a personal tragedy.",
    poster: "https://image.tmdb.org/t/p/w500/27vEYsRVtGuBdpOf9MtTv2rUSPf.jpg",
    platform: "Prime Video",
  },
  {
    id: "6",
    title: "Shogun",
    genre: ["Drama", "Adventure", "History"],
    year: 2024,
    rating: 8.7,
    description: "An English sailor becomes embroiled in a power struggle in feudal Japan.",
    poster: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgmT.jpg",
    platform: "Hulu",
  },
  {
    id: "7",
    title: "Only Murders in the Building",
    genre: ["Comedy", "Mystery"],
    year: 2021,
    rating: 8.1,
    description: "Three strangers who share an obsession with true crime suddenly find themselves caught up in one.",
    poster: "https://image.tmdb.org/t/p/w500/q5qECRwMEkYlu8YMGPixRTUbMOb.jpg",
    platform: "Hulu",
  },
  {
    id: "8",
    title: "The Last of Us",
    genre: ["Action", "Drama", "Sci-Fi"],
    year: 2023,
    rating: 8.8,
    description: "A hardened survivor and a young girl journey across a post-apocalyptic United States.",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    platform: "HBO Max",
  },
];
