const { User } = require('../models');
const { CustomException } = require('../utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { JWT_SECRET } = process.env;
const saltRounds = 10;

const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description, role, country } = request.body;
    
    try {
        const hash = bcrypt.hashSync(password, saltRounds);
        
        const user = new User({
            username,
            email,
            password: hash,
            image,
            country: country || 'Saudi Arabia',
            description,
            isSeller,
            phone,
            role: role || (isSeller ? 'lawyer' : 'client')
        });
        
        await user.save();
        
        return response.status(201).send({
            error: false,
            message: 'New user created!'
        });
    }
    catch({message}) {
        console.log('Registration error:', message);
        if(message.includes('E11000')) {
            return response.status(400).send({
                error: true,
                message: 'Choose a unique username!'
            });
        }
        return response.status(500).send({
            error: true,
            message: 'Something went wrong!'
        });
    }
}

const authLogin = async (request, response) => {
    const { username, password } = request.body;
    
    try {
        // ✅ NEW: Accept both username AND email for login
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }  // Allow email in username field
            ]
        });
        
        if(!user) {
            throw CustomException('Check username or password!', 404);
        }
        
        const match = bcrypt.compareSync(password, user.password);
        
        if(match) {
            const { password, ...data } = user._doc;
            
            const token = jwt.sign({
                _id: user._id,
                isSeller: user.isSeller
            }, JWT_SECRET, { expiresIn: '7 days' });
            
            // Auto-detect localhost from request origin
            const origin = request.get('origin') || '';
            const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

            const cookieConfig = {
                httpOnly: true,
                sameSite: isLocalhost ? 'lax' : 'none',
                secure: !isLocalhost,  // false for localhost (HTTP), true for production (HTTPS)
                maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
                path: '/'
            }
            
            return response.cookie('accessToken', token, cookieConfig)
                .status(202).send({
                    error: false,
                    message: 'Success!',
                    user: data
                });
        }
        
        throw CustomException('Check username or password!', 404);
    }
    catch({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
}

const authLogout = async (request, response) => {
    // Auto-detect localhost from request origin (must match login settings)
    const origin = request.get('origin') || '';
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    return response.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: isLocalhost ? 'lax' : 'none',
        secure: !isLocalhost,
        path: '/'
    })
    .send({
        error: false,
        message: 'User have been logged out!'
    });
}

const authStatus = async (request, response) => {
    try {
        const user = await User.findOne({ _id: request.userID }).select('-password');
        
        if(!user) {
            throw CustomException('User not found!', 404);
        }
        
        return response.send({
            error: false,
            message: 'Success!',
            user
        });
    }
    catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        });
    }
}

module.exports = {
    authLogin,
    authLogout,
    authRegister,
    authStatus
};
