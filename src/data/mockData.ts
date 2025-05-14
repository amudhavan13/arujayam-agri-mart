
import { Product, User } from "../types";

// Mock Agricultural Products
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Compact Tractor",
    description: "Powerful 25HP compact tractor ideal for small farms and gardens. Features include 4-wheel drive, power steering, and a 3-point hitch system.",
    price: 125000,
    images: [
      "https://images.unsplash.com/photo-1580674684089-ba619962bf19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8dHJhY3RvcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1568637544754-4d303a8b3927?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fHRyYWN0b3IlMjByZWR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1584134239909-5d0466225877?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhY3RvciUyMGdyZWVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
    ],
    category: "tractors",
    stockQuantity: 5,
    colors: ["red", "green", "blue"],
    specifications: {
      "engine": "25HP diesel",
      "transmission": "8F/8R",
      "lift capacity": "650 kg",
      "weight": "1200 kg"
    },
    reviews: [
      {
        id: "r1",
        userId: "user1",
        username: "Farmer Kumar",
        rating: 5,
        comment: "This tractor is perfect for my small farm. Excellent fuel efficiency and powerful enough for all my needs.",
        images: [],
        createdAt: "2023-05-15T10:30:00Z"
      }
    ]
  },
  {
    id: "2",
    name: "Rotavator",
    description: "Heavy-duty rotavator for soil preparation. Efficiently breaks up soil clumps and incorporates crop residue.",
    price: 45000,
    images: [
      "https://5.imimg.com/data5/ANDROID/Default/2021/12/AR/SW/XB/88470418/product-jpeg-500x500.jpg",
      "https://4.imimg.com/data4/RG/WH/MY-34739536/tractor-rotavator-500x500.jpg"
    ],
    category: "implements",
    stockQuantity: 10,
    colors: ["orange", "red"],
    specifications: {
      "working width": "1.5m",
      "number of blades": "36",
      "power requirement": "35HP+",
      "weight": "350kg"
    },
    reviews: []
  },
  {
    id: "3",
    name: "Water Pump Set",
    description: "High-efficiency irrigation pump for farms and gardens. Provides reliable water supply for all your irrigation needs.",
    price: 18500,
    images: [
      "https://5.imimg.com/data5/ANDROID/Default/2022/8/VG/CL/BK/25514547/product-jpeg-500x500.jpg",
      "https://5.imimg.com/data5/SELLER/Default/2021/7/HM/UE/JI/1551492/agricultural-water-pump-500x500.jpg"
    ],
    category: "irrigation",
    stockQuantity: 15,
    colors: ["blue", "green"],
    specifications: {
      "flow rate": "500L/min",
      "head": "15m",
      "power": "5HP",
      "inlet/outlet": "2 inch"
    },
    reviews: []
  },
  {
    id: "4",
    name: "Sprayer",
    description: "Battery-operated backpack sprayer for efficient pesticide and fertilizer application.",
    price: 2500,
    images: [
      "https://m.media-amazon.com/images/I/71FxQY07dUL._AC_UF1000,1000_QL80_.jpg",
      "https://rukminim1.flixcart.com/image/850/1000/xif0q/sprayer/t/o/h/yes-12-12-litre-battery-sprayer-pump-agriculture-fertilizer-original-imagg3nsengyg48f.jpeg"
    ],
    category: "crop protection",
    stockQuantity: 25,
    colors: ["yellow", "black", "green"],
    specifications: {
      "capacity": "16L",
      "battery": "12V, 8Ah",
      "spray distance": "6-8m",
      "working time": "4-6 hours"
    },
    reviews: []
  },
  {
    id: "5",
    name: "Seed Drill",
    description: "Precision seed drill for accurate seed placement and spacing. Improves germination rates and crop establishment.",
    price: 35000,
    images: [
      "https://5.imimg.com/data5/ANDROID/Default/2021/12/OO/SK/CK/48528541/product-jpeg-500x500.jpg",
      "https://5.imimg.com/data5/VL/UN/MY-26569489/tractor-mounted-automatic-seed-cum-fertilizer-drill-500x500.jpg"
    ],
    category: "implements",
    stockQuantity: 8,
    colors: ["red", "green"],
    specifications: {
      "rows": "9",
      "row spacing": "18-20cm",
      "capacity": "45kg seeds",
      "power requirement": "35HP+"
    },
    reviews: []
  },
  {
    id: "6",
    name: "Power Weeder",
    description: "Petrol-powered weeder for effective weed control between crop rows. Saves time and reduces labor costs.",
    price: 22000,
    images: [
      "https://5.imimg.com/data5/SELLER/Default/2021/6/LD/MS/QK/454677/power-weeder-for-agriculture-500x500.jpg",
      "https://cpimg.tistatic.com/05712296/b/4/Power-Weeder.jpg"
    ],
    category: "crop protection",
    stockQuantity: 12,
    colors: ["red", "orange"],
    specifications: {
      "engine": "5.5HP petrol",
      "working width": "90cm",
      "fuel tank": "3.6L",
      "weight": "60kg"
    },
    reviews: []
  },
  {
    id: "7",
    name: "Disc Harrow",
    description: "Heavy-duty disc harrow for breaking up soil clods and preparing seedbeds. Essential for proper land preparation.",
    price: 55000,
    images: [
      "https://5.imimg.com/data5/SELLER/Default/2023/3/MJ/MN/SV/8587044/tractor-disc-harrow-500x500.jpg",
      "https://5.imimg.com/data5/ANDROID/Default/2021/1/XA/IK/DY/97119204/product-jpeg-500x500.jpg"
    ],
    category: "implements",
    stockQuantity: 6,
    colors: ["red", "green"],
    specifications: {
      "discs": "16",
      "disc diameter": "20 inch",
      "working width": "7 feet",
      "weight": "480kg"
    },
    reviews: []
  },
  {
    id: "8",
    name: "Cultivator",
    description: "Spring loaded cultivator for primary and secondary tillage. Effectively breaks soil and uproots weeds.",
    price: 28000,
    images: [
      "https://5.imimg.com/data5/KR/PK/MY-2318638/spring-loaded-cultivator-500x500.jpg",
      "https://5.imimg.com/data5/ANDROID/Default/2020/11/JN/YU/TE/47170483/product-jpeg-500x500.jpg"
    ],
    category: "implements",
    stockQuantity: 9,
    colors: ["red", "blue"],
    specifications: {
      "tynes": "9",
      "working width": "7 feet",
      "power requirement": "35HP+",
      "weight": "220kg"
    },
    reviews: []
  }
];

// Admin user
export const adminUser: User = {
  id: "admin",
  username: "admin",
  email: "admin@gmail.com",
  address: "Agricultural Machinery Shop, Main Road",
  phoneNumber: "9876543210",
  profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  isAdmin: true
};

// Mock users
export const mockUsers: User[] = [
  adminUser,
  {
    id: "user1",
    username: "Farmer Kumar",
    email: "farmer@example.com",
    address: "123 Farm Road, Village",
    phoneNumber: "9876543211",
    profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
    isAdmin: false
  },
  {
    id: "user2",
    username: "Agronomist Lakshmi",
    email: "lakshmi@example.com",
    address: "456 Field Avenue, Town",
    phoneNumber: "9876543212",
    profilePicture: "https://randomuser.me/api/portraits/women/22.jpg",
    isAdmin: false
  }
];

// Categories
export const productCategories = [
  { id: "tractors", name: "Tractors & Power" },
  { id: "implements", name: "Farm Implements" },
  { id: "irrigation", name: "Irrigation Equipment" },
  { id: "seeds", name: "Seeds & Planting" },
  { id: "crop-protection", name: "Crop Protection" },
  { id: "harvest", name: "Harvesting Equipment" },
  { id: "storage", name: "Post-Harvest & Storage" },
  { id: "tools", name: "Hand Tools" }
];

// Available colors
export const availableColors = [
  { id: "red", name: "Red", hex: "#e53935" },
  { id: "green", name: "Green", hex: "#43a047" },
  { id: "blue", name: "Blue", hex: "#1e88e5" },
  { id: "yellow", name: "Yellow", hex: "#fdd835" },
  { id: "black", name: "Black", hex: "#212121" },
  { id: "orange", name: "Orange", hex: "#fb8c00" }
];
