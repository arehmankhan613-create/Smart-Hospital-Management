// ==========================================
// MediCore
// Smart Hospital Management System
// Frontend JavaScript
// ==========================================


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");

if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

        sidebar.classList.toggle("show");

    });

}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const sidebarLinks =
    document.querySelectorAll(".sidebar-menu a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", () => {

        sidebarLinks.forEach(item => {

            item.classList.remove("active");

        });

        link.classList.add("active");


        // Close mobile sidebar

        if (window.innerWidth <= 850) {

            sidebar.classList.remove("show");

        }

    });

});


// ==========================================
// NOTIFICATION BUTTON
// ==========================================

const notificationButton =
    document.querySelector(".notification-btn");

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            showNotification(
                "You have 3 new notifications"
            );

        }
    );

}


// ==========================================
// SEARCH BUTTON
// ==========================================

const searchButton =
    document.querySelector(
        ".icon-button:first-child"
    );

if (searchButton) {

    searchButton.addEventListener(
        "click",
        () => {

            const search =
                prompt(
                    "Search patients, doctors or appointments:"
                );

            if (!search) return;

            showNotification(
                `Searching for "${search}"...`
            );

        }
    );

}


// ==========================================
// VIEW ALL BUTTONS
// ==========================================

const viewButtons =
    document.querySelectorAll(".view-all");

viewButtons.forEach(button => {

    button.addEventListener("click", () => {

        showNotification(
            "This section will be connected to the backend soon."
        );

    });

});


// ==========================================
// ADD PATIENT BUTTON
// ==========================================

const addPatientButton =
    document.querySelector(
        "#patients .primary-button"
    );

if (addPatientButton) {

    addPatientButton.addEventListener(
        "click",
        () => {

            openPatientForm();

        }
    );

}


// ==========================================
// NEW MEDICAL RECORD
// ==========================================

const newRecordButton =
    document.querySelector(
        "#records .primary-button"
    );

if (newRecordButton) {

    newRecordButton.addEventListener(
        "click",
        () => {

            showNotification(
                "Medical record module is ready for backend integration."
            );

        }
    );

}


// ==========================================
// QUICK ACTIONS
// ==========================================

const quickActions =
    document.querySelectorAll(
        ".quick-grid button"
    );

quickActions.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const action =
                button.querySelector("span");

            if (!action) return;

            showNotification(
                `${action.innerText} selected`
            );

        }
    );

});


// ==========================================
// PATIENT VIEW BUTTONS
// ==========================================

const patientActionButtons =
    document.querySelectorAll(
        ".action-btn"
    );

patientActionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showNotification(
                "Patient profile will open here."
            );

        }
    );

});


// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message) {

    const oldNotification =
        document.querySelector(
            ".medi-notification"
        );

    if (oldNotification) {

        oldNotification.remove();

    }


    const notification =
        document.createElement("div");

    notification.className =
        "medi-notification";


    notification.innerHTML = `

        <i class="fa-solid fa-circle-info"></i>

        <span>${message}</span>

        <button>
            <i class="fa-solid fa-xmark"></i>
        </button>

    `;


    document.body.appendChild(notification);


    notification.querySelector("button")
        .addEventListener(
            "click",
            () => {

                notification.remove();

            }
        );


    setTimeout(() => {

        if (notification) {

            notification.classList.add(
                "hide"
            );

            setTimeout(() => {

                notification.remove();

            }, 300);

        }

    }, 3500);

}


// ==========================================
// PATIENT FORM
// ==========================================

function openPatientForm() {

    const existing =
        document.querySelector(
            ".patient-modal"
        );

    if (existing) return;


    const modal =
        document.createElement("div");

    modal.className =
        "patient-modal";


    modal.innerHTML = `

        <div class="patient-modal-box">

            <div class="modal-header">

                <div>

                    <span>
                        PATIENT MANAGEMENT
                    </span>

                    <h2>
                        Register New Patient
                    </h2>

                </div>

                <button
                    class="close-modal"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <form id="patientForm">

                <div class="form-grid">

                    <div class="form-group">

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter patient name"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Phone
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Date of Birth
                        </label>

                        <input
                            type="date"
                            name="dob"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Gender
                        </label>

                        <select
                            name="gender"
                            required
                        >

                            <option value="">
                                Select Gender
                            </option>

                            <option value="male">
                                Male
                            </option>

                            <option value="female">
                                Female
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Blood Group
                        </label>

                        <select name="bloodGroup">

                            <option value="">
                                Select Blood Group
                            </option>

                            <option>A+</option>
                            <option>A-</option>
                            <option>B+</option>
                            <option>B-</option>
                            <option>AB+</option>
                            <option>AB-</option>
                            <option>O+</option>
                            <option>O-</option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label>
                            Emergency Contact
                        </label>

                        <input
                            type="tel"
                            name="emergency"
                            placeholder="Emergency number"
                        >

                    </div>


                    <div class="form-group full">

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            placeholder="Enter patient address"
                        ></textarea>

                    </div>

                </div>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="cancel-modal"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button"
                    >

                        <i class="fa-solid fa-user-plus"></i>

                        Register Patient

                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(modal);


    // Close button

    modal.querySelector(
        ".close-modal"
    ).addEventListener(
        "click",
        () => {

            modal.remove();

        }
    );


    // Cancel button

    modal.querySelector(
        ".cancel-modal"
    ).addEventListener(
        "click",
        () => {

            modal.remove();

        }
    );


    // Submit form

    modal.querySelector(
        "#patientForm"
    ).addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            showNotification(
                "Patient registration form submitted."
            );


            modal.remove();

        }
    );

}


// ==========================================
// CURRENT YEAR
// ==========================================

const footer =
    document.querySelector("footer");

if (footer) {

    const year =
        new Date().getFullYear();

    const footerText =
        footer.querySelector("p");

    if (footerText) {

        footerText.innerText =
            `© ${year} MediCore. All rights reserved.`;

    }

}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "MediCore Dashboard Loaded"
        );

    }
);
