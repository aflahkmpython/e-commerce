import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '../ProductCard';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Futuristic Sneakers',
    slug: 'futuristic-sneakers',
    price: '199.99',
    category_name: 'Footwear',
    average_rating: 4.5,
    images: [{ image: 'test-image.jpg', is_primary: true }]
  };

  it('renders product details correctly', () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={mockProduct} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Futuristic Sneakers')).toBeInTheDocument();
    expect(screen.getByText('Footwear')).toBeInTheDocument();
    expect(screen.getByText('$199.99')).toBeInTheDocument();
  });

  it('calls dispatch when "Add to Cart" is clicked', () => {
    const store = mockStore({ auth: { isAuthenticated: true } });
    store.dispatch = vi.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductCard product={mockProduct} />
        </BrowserRouter>
      </Provider>
    );

    const cartButton = screen.getByRole('add-to-cart-button');
    fireEvent.click(cartButton);

    expect(store.dispatch).toHaveBeenCalled();
  });
});
