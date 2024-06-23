const csrf = require('csurf');

const inProduction = process.env.NODE_ENV === 'production';
const csurfOptions = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode:  !inProduction,
    cookie: true,
};

// const csurfOptions = {
//     protected_operations: ["PATCH"],
//     protected_content_types: ["application/json"],
//     development_mode:  !inProduction,
//     cookie: {
//         secure: inProduction, // Only set secure cookies in production
//         sameSite: 'strict' // Use strict sameSite policy for CSRF cookies
//     }
// };

const csrfProtection = csrf({
    cookie: true
});

module.exports = csrfProtection;