# ⚖️ HearEase: Optimizing Barangay Hearing Scheduling

**An AI-driven system employing Deep Neural Networks (DNN) to maximize barangay hearing schedules and forecast case resolution times.**

![Project Status](https://img.shields.io/badge/Status-Done-brightgreen)
![Project Status](https://img.shields.io/badge/Status-Published-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Django%20%7C%20React%20%7C%20Supabase-blue)

**🚀 Live Demo:** [https://hearease.me](https://hearease.me)

## 📰 Published

This project has been officially published and presented at an IEEE conference. You can access the full paper here:

**📄 [IEEE Xplore — HearEase: Optimizing Barangay Hearing Scheduling](https://ieeexplore.ieee.org/document/11634173)**

## 📖 Overview

As legal cases within Philippine communities grow in complexity, the need for effective barangay hearing scheduling becomes critical. Traditional scheduling techniques often suffer from flaws that lead to postponed hearings and unresolved cases. **HearEase** is a web-based information system designed to address these challenges by utilizing **Deep Neural Networks (DNN)** to optimize hearing schedules and predict case resolution times.

This project is piloted in **Barangay Tetuan, Zamboanga City**, a location selected for its high volume of annual cases, active community involvement, and willingness to modernize their judicial processes.

**How it works:**
By analyzing historical data from past hearings and case results, HearEase employs advanced deep learning models to provide predictive analytics. This allows the system to:

- Provide a user-friendly interface for the _Lupong Tagapamayapa_.
- Automate scheduling to reduce conflicts and delays.
- Forecast the likely duration and resolution time of new cases.

**Impact:**
Initial outcomes indicate that HearEase significantly enhances the effectiveness of barangay hearings. By reducing the administrative workload on barangay staff and ensuring timely case resolutions, the system ultimately seeks to improve the accessibility of justice for the local populace.

## 🎯 Objectives of the Study

### General Objective

To develop **HearEase**, an AI-driven system that optimizes barangay hearing schedules and predicts case resolution times using Deep Neural Networks, aimed at reducing the administrative workload and enhancing access to justice in **Barangay Tetuan, Zamboanga City**.

### Specific Objectives

1.  **Analyze Workflows:** Examine existing case resolution workflows and scheduling constraints in Barangay Tetuan to identify bottlenecks and requirements for automation.
2.  **Data Collection:** Aggregate historical hearing data and case outcomes to train the Deep Neural Network (DNN) model for accurate schedule prediction.
3.  **System Development:** Design and build the web-based information system that integrates AI-driven scheduling, digital case management, and automated notification features.
4.  **Model Evaluation:** Test the predictive accuracy of the DNN model in forecasting hearing frequency and resolution timelines against actual historical data.
5.  **User Assessment:** Evaluate the system’s usability, efficiency, and user satisfaction among the _Lupong Tagapamayapa_ compared to traditional manual procedures.

## 💻 Tech Stack

### Frontend

- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Hosting:** Vercel

### Backend & AI

- **Framework:** Django REST Framework (DRF)
- **Language:** Python 3.11+
- **AI/ML:** Scikit-learn / TensorFlow (for DNN Model)
- **Hosting:** Render

### Database & Services

- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Firebase Auth (Google Sign-In & Email/Password)
- **Email Notifications:** Resend API
- **SMS Notifications:** [Android SMS Gateway](https://sms-gate.app/)
- **Storage:** Supabase Storage

## 🚀 Key Features

- **🤖 AI-Powered Scheduling:** Automatically suggests hearing dates based on predicted case resolution times and Lupon availability.
- **📂 Digital Case Management:** Complete digitization of complaints, respondents, and case history.
- **🔐 Secure Authentication:** Google Sign-In and Role-Based Access Control (Admin/Lupon vs. Constituents).
- **🔔 Automated Notifications:** Email and SMS verification/notifications for hearing reminders via Resend and SMS-Gate.
- **📊 Analytics Dashboard:** Visual insights into case volume, resolution rates, and scheduling efficiency.
- **📄 Document Generation:** Auto-generation of standard Barangay forms (Summons, Certificates to File Action, etc.).

## 📄 License

This project is developed for academic purposes.

**Members:** [Emman Nuñez](https://github.com/KrillKill123), [Ruthiemy Oribello](https://github.com/Rthuro), [Romelyn Dangaran](https://github.com/PuchiiZz)

**Institution:** Western Mindanao State University
