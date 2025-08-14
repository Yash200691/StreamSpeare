import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.get('/signup', (req, res) => {
    res.render('auth/signup');
});

// Protected routes
router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/watch/:id', (req, res) => {
    res.render('watch', { videoId: req.params.id });
});

router.get('/profile', verifyJwt, (req, res) => {
    res.render('profile');
});

router.get('/dashboard', verifyJwt, (req, res) => {
    res.render('dashboard');
});

router.get('/upload', verifyJwt, (req, res) => {
    res.render('upload');
});

router.get('/channel/:username', (req, res) => {
    res.render('channel', { username: req.params.username });
});

router.get('/search', (req, res) => {
    res.render('search', { query: req.query.q || '' });
});

router.get('/history', verifyJwt, (req, res) => {
    res.render('history');
});

router.get('/liked', verifyJwt, (req, res) => {
    res.render('liked');
});

router.get('/playlists', verifyJwt, (req, res) => {
    res.render('playlists');
});

router.get('/subscriptions', verifyJwt, (req, res) => {
    res.render('subscriptions');
});

router.get('/trending', (req, res) => {
    res.render('trending');
});

// Logout route
router.get('/logout', verifyJwt, async (req, res) => {
    try {
        await fetch('http://localhost:8000/api/v1/users/logout', {
            method: 'POST',
            headers: {
                'Cookie': req.headers.cookie
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    res.redirect('/login');
});

export default router;