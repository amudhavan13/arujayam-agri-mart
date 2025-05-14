
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import {
  User,
  Product,
  CartItem,
  Order,
  FilterOptions
} from "../types";

// Initial state
type AppState = {
  user: User | null;
  isAuthenticated: boolean;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  recentlyViewed: Product[];
  filterOptions: FilterOptions;
};

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  products: [],
  cart: [],
  orders: [],
  recentlyViewed: [],
  filterOptions: {
    category: [],
    priceRange: {
      min: 0,
      max: 100000
    },
    colors: [],
    specifications: {}
  }
};

// Action types
type ActionType =
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_ITEM_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "TOGGLE_CART_ITEM_SELECTION"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { orderId: string; status: string } }
  | { type: "ADD_TO_RECENTLY_VIEWED"; payload: Product }
  | { type: "UPDATE_FILTER_OPTIONS"; payload: Partial<FilterOptions> };

// Reducer function
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
      };
    case "ADD_TO_CART": {
      const existingItemIndex = state.cart.findIndex(
        (item) => item.productId === action.payload.productId && item.color === action.payload.color
      );
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          cart: updatedCart,
        };
      } else {
        // New item
        return {
          ...state,
          cart: [...state.cart, action.payload],
        };
      }
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.productId !== action.payload),
      };
    case "UPDATE_CART_ITEM_QUANTITY": {
      const { productId, quantity } = action.payload;
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    }
    case "TOGGLE_CART_ITEM_SELECTION": {
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === action.payload ? { ...item, selected: !item.selected } : item
        ),
      };
    }
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };
    case "ADD_ORDER":
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };
    case "UPDATE_ORDER_STATUS": {
      const { orderId, status } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, orderStatus: status as any } : order
        ),
      };
    }
    case "ADD_TO_RECENTLY_VIEWED": {
      const existingItem = state.recentlyViewed.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        // Move to front of array
        return {
          ...state,
          recentlyViewed: [
            action.payload,
            ...state.recentlyViewed.filter((item) => item.id !== action.payload.id),
          ].slice(0, 8), // Keep only the last 8 items
        };
      } else {
        return {
          ...state,
          recentlyViewed: [action.payload, ...state.recentlyViewed].slice(0, 8),
        };
      }
    }
    case "UPDATE_FILTER_OPTIONS":
      return {
        ...state,
        filterOptions: {
          ...state.filterOptions,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

// Create context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: userData });
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
      }
    }

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const cartData = JSON.parse(storedCart);
        cartData.forEach((item: CartItem) => {
          dispatch({ type: "ADD_TO_CART", payload: item });
        });
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem("cart");
      }
    }

    const storedRecentlyViewed = localStorage.getItem("recentlyViewed");
    if (storedRecentlyViewed) {
      try {
        const recentlyViewedData = JSON.parse(storedRecentlyViewed);
        recentlyViewedData.forEach((product: Product) => {
          dispatch({ type: "ADD_TO_RECENTLY_VIEWED", payload: product });
        });
      } catch (error) {
        console.error("Failed to parse recently viewed from localStorage", error);
        localStorage.removeItem("recentlyViewed");
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.cart));
  }, [state.cart]);

  // Save user to localStorage on change
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.user]);

  // Save recently viewed to localStorage on change
  useEffect(() => {
    localStorage.setItem("recentlyViewed", JSON.stringify(state.recentlyViewed));
  }, [state.recentlyViewed]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
