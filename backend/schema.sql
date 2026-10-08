CREATE TABLE IF NOT EXISTS carrier_applications (
    id BIGSERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,

    company VARCHAR(255),

    equipment_type VARCHAR(100),
    number_of_trucks VARCHAR(50),

    mc_dot_number VARCHAR(100),

    message TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'New',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carrier_applications_created_at
ON carrier_applications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carrier_applications_email
ON carrier_applications (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_carrier_applications_status
ON carrier_applications (status);