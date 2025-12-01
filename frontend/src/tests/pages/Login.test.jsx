import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18nForTests';

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </I18nextProvider>
        );
    };

    it('renders login form', () => {
        renderComponent();
        expect(screen.getByText(/Mortgage Simulator/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });

    it('handles login submission', async () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('displays error on invalid credentials', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });

        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });
});
