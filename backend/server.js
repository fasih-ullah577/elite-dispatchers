require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const {
    query,
    checkDatabase
} = require("./db");

const app = express();

const PORT = Number(
    process.env.PORT || 3000
);

app.disable("x-powered-by");


// ===============================
// SECURITY
// ===============================

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);


// ===============================
// CORS
// ===============================

const allowedOrigins =
    (process.env.CORS_ORIGINS || "")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {

            // Allow requests without an Origin header
            if (!origin) {
                return callback(null, true);
            }

            if (
                allowedOrigins.includes(origin)
            ) {
                return callback(null, true);
            }

            return callback(
                new Error(
                    "CORS origin is not allowed."
                )
            );
        },

        methods: [
            "GET",
            "POST"
        ],

        allowedHeaders: [
            "Content-Type"
        ]
    })
);


// ===============================
// REQUEST BODY
// ===============================

app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "100kb"
    })
);


// ===============================
// RATE LIMIT
// ===============================

const applicationLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        limit: 10,

        standardHeaders: "draft-7",

        legacyHeaders: false,

        message: {
            success: false,

            message:
                "Too many applications. Please try again later."
        }
    });


// ===============================
// FORM VALIDATION
// ===============================

const applicationSchema =
    z.object({

        firstName:
            z.string()
                .trim()
                .min(1)
                .max(100),

        lastName:
            z.string()
                .trim()
                .min(1)
                .max(100),

        phone:
            z.string()
                .trim()
                .min(7)
                .max(50),

        email:
            z.string()
                .trim()
                .email()
                .max(255),

        company:
            z.string()
                .trim()
                .max(255)
                .optional()
                .default(""),

        truck:
            z.string()
                .trim()
                .max(100)
                .optional()
                .default(""),

        trucks:
            z.string()
                .trim()
                .max(50)
                .optional()
                .default(""),

        mc:
            z.string()
                .trim()
                .max(100)
                .optional()
                .default(""),

        message:
            z.string()
                .trim()
                .max(5000)
                .optional()
                .default("")
    });


// ===============================
// HEALTH CHECK
// ===============================

app.get(
    "/api/health",

    async (req, res) => {

        try {

            await checkDatabase();

            res.json({
                success: true,

                database:
                    "connected",

                service:
                    "Elite Dispatchers API"
            });

        } catch (error) {

            console.error(
                "Database error:",
                error
            );

            res.status(503).json({
                success: false,

                database:
                    "unavailable"
            });
        }
    }
);


// ===============================
// CARRIER APPLICATION
// ===============================

app.post(
    "/api/applications",

    applicationLimiter,

    async (req, res) => {

        try {

            const parsed =
                applicationSchema.safeParse(
                    req.body
                );


            // Validation failed
            if (!parsed.success) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please check the form fields.",

                    errors:
                        parsed.error
                            .flatten()
                            .fieldErrors
                });
            }


            const {
                firstName,
                lastName,
                phone,
                email,
                company,
                truck,
                trucks,
                mc,
                message
            } = parsed.data;


            // Insert into PostgreSQL
            const result =
                await query(
                    `
                    INSERT INTO carrier_applications
                    (
                        first_name,
                        last_name,
                        phone,
                        email,
                        company,
                        equipment_type,
                        number_of_trucks,
                        mc_dot_number,
                        message
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9
                    )

                    RETURNING
                        id,
                        status,
                        created_at
                    `,

                    [
                        firstName,
                        lastName,
                        phone,
                        email.toLowerCase(),
                        company,
                        truck,
                        trucks,
                        mc,
                        message
                    ]
                );


            // Success
            return res.status(201).json({

                success: true,

                message:
                    "Application submitted successfully.",

                application:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Application error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Something went wrong while submitting your application."
            });
        }
    }
);


// ===============================
// 404
// ===============================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Endpoint not found."
        });
    }
);


// ===============================
// START SERVER
// ===============================

app.listen(
    PORT,

    () => {

        console.log(
            `Elite Dispatchers API running on port ${PORT}`
        );

    }
);