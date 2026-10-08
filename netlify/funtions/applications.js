const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Method not allowed."
            })
        };
    }

    try {
        // Parse request body
        let body;

        try {
            body = JSON.parse(event.body || "{}");
        } catch {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Invalid request."
                })
            };
        }

        // Read and clean form values
        const firstName = String(body.firstName || "").trim();
        const lastName = String(body.lastName || "").trim();
        const phone = String(body.phone || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const company = String(body.company || "").trim();
        const truck = String(body.truck || "").trim();
        const trucks = String(body.trucks || "").trim();
        const mc = String(body.mc || "").trim();
        const message = String(body.message || "").trim();

        // Basic validation
        if (!firstName || firstName.length > 100) {
            return validationError();
        }

        if (!lastName || lastName.length > 100) {
            return validationError();
        }

        if (!phone || phone.length < 7 || phone.length > 50) {
            return validationError();
        }

        if (
            !email ||
            email.length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return validationError();
        }

        if (company.length > 255) {
            return validationError();
        }

        if (truck.length > 100) {
            return validationError();
        }

        if (trucks.length > 50) {
            return validationError();
        }

        if (mc.length > 100) {
            return validationError();
        }

        if (message.length > 5000) {
            return validationError();
        }

        // Database connection
        if (!process.env.DATABASE_URL) {
            console.error("DATABASE_URL is not configured.");

            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Server configuration error."
                })
            };
        }

        const sql = neon(process.env.DATABASE_URL);

        // Insert application
        const result = await sql`
            INSERT INTO carrier_applications (
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
            VALUES (
                ${firstName},
                ${lastName},
                ${phone},
                ${email},
                ${company},
                ${truck},
                ${trucks},
                ${mc},
                ${message}
            )
            RETURNING id, status, created_at
        `;

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "https://edllc.netlify.app",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                success: true,
                message: "Application submitted successfully.",
                application: result[0]
            })
        };

    } catch (error) {
        console.error("Application error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Something went wrong while submitting your application."
            })
        };
    }
};

function validationError() {
    return {
        statusCode: 400,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            success: false,
            message: "Please check the form fields."
        })
    };
}