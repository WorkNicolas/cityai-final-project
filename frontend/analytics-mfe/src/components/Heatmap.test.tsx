import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import Heatmap from './Heatmap';
import { gql } from '@apollo/client';

// Mock leaflet and react-leaflet since they require a real DOM
vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet') as any;
  return {
    ...actual,
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    useMap: () => ({ removeLayer: vi.fn(), addLayer: vi.fn() }),
  };
});

vi.mock('leaflet.heat', () => ({}));
vi.mock('leaflet', () => {
  return {
    default: {
      heatLayer: vi.fn(() => ({ addTo: vi.fn() })),
    },
    heatLayer: vi.fn(() => ({ addTo: vi.fn() })),
  };
});

const GET_HEATMAP_DATA = gql`
  query GetHeatmapData($limit: Int) {
    issues(limit: $limit) {
      items {
        id
        coordinates
      }
    }
  }
`;

const mocks = [
  {
    request: {
      query: GET_HEATMAP_DATA,
      variables: { limit: 1000 },
      context: { service: 'issues' }
    },
    result: {
      data: {
        issues: {
          items: [
            { id: '1', coordinates: [-79.3832, 43.6532] },
            { id: '2', coordinates: [-79.3842, 43.6542] },
          ]
        }
      }
    }
  }
];

describe('Heatmap Component', () => {
  it('renders loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Heatmap />
      </MockedProvider>
    );
    expect(screen.getByText('Loading map data...')).toBeDefined();
  });

  it('renders heatmap data successfully', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Heatmap />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeDefined();
    });
  });

  it('shows error state if data fetching fails', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_HEATMAP_DATA,
          variables: { limit: 1000 },
          context: { service: 'issues' }
        },
        error: new Error('An error occurred'),
      }
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <Heatmap />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load geographic data.')).toBeDefined();
    });
  });
});
