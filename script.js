// ==========================================
// MOBILE MENU
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });

    });
}


// ==========================================
// POSTGRESQL APPLICATION FORM
// ==========================================


   const API_URL = "/.netlify/functions/applications";

const carrierForm =
    document.getElementById("carrierForm");


if (carrierForm) {

    carrierForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // Find the button inside the form
            const submitButton =
                carrierForm.querySelector(
                    'button[type="submit"]'
                );

            // Create message element automatically
            let formMessage =
                document.getElementById("formMessage");

            if (!formMessage) {

                formMessage =
                    document.createElement("div");

                formMessage.id =
                    "formMessage";

                carrierForm.appendChild(
                    formMessage
                );
            }


            // Disable submit button
            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";
            }


            formMessage.textContent = "";

            formMessage.className = "";


            // Get form data
            const formData =
                new FormData(carrierForm);


            const data = {

                firstName:
                    formData.get("firstName")?.trim() || "",

                lastName:
                    formData.get("lastName")?.trim() || "",

                phone:
                    formData.get("phone")?.trim() || "",

                email:
                    formData.get("email")?.trim() || "",

                company:
                    formData.get("company")?.trim() || "",

                truck:
                    formData.get("truck")?.trim() || "",

                trucks:
                    formData.get("trucks")?.trim() || "",

                mc:
                    formData.get("mc")?.trim() || "",

                message:
                    formData.get("message")?.trim() || ""
            };


            console.log(
                "Sending application:",
                data
            );


            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Backend response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Application submission failed."
                    );
                }


                // ==================================
                // SUCCESS
                // ==================================

                formMessage.textContent =
                    "Your application has been submitted successfully!";

                formMessage.className =
                    "success";


                carrierForm.reset();


            } catch (error) {

                console.error(
                    "FORM ERROR:",
                    error
                );


                formMessage.textContent =
                    error.message ||
                    "Unable to submit your application.";

                formMessage.className =
                    "error";

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Request";
                }
            }

        }
    );
}