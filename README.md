# 🌟 **Internship Management System** - **Spring Boot + Angular** 🌟

## 🚀 **Overview**

Welcome to the **Internship Management System**, a comprehensive solution designed to streamline the management of internship requests, user roles, and document handling for organizations. Powered by **Spring Boot** on the backend and **Angular** on the frontend, this system provides a **secure, role-based** platform for managing internships, from submission to validation. Whether you're an **intern**, a **supervisor**, or an **admin**, this system is built to keep everything organized and efficient.

---

## 🔑 **Key Features**

- 🔐 **JWT Authentication**: Secure login with **JSON Web Tokens**.
- 🎮 **Role-Based Access Control**: Different dashboards based on your role (Intern, Supervisor, Admin, etc.).
- 📝 **Internship Request Management**: Easy submission, validation, and tracking of internship requests (Demande).
- 📂 **Document Handling**: Upload, download, and manage internship-related documents in real time.
- 📊 **Comprehensive Dashboards**: Dynamic dashboards for different user roles, each with tailored functionality.
- ⚡ **Real-Time Updates**: Instant feedback and updates on request statuses and document approval.

---

## 📸 **Screenshots**

Here are a few screenshots to showcase the beautiful and **intuitive UI** of the application. Each screenshot represents key parts of the user experience from both the **Admin** and **Intern** perspectives.

### 📱 **Admin Dashboard**
![Admin Dashboard](https://via.placeholder.com/800x400.png?text=Admin+Dashboard+Screenshot)

The **Admin Dashboard** provides an overview of all intern activities and provides options for managing users and roles.

### 🧑‍💻 **Intern Dashboard**
![Intern Dashboard](https://via.placeholder.com/800x400.png?text=Intern+Dashboard+Screenshot)

The **Intern Dashboard** allows users to easily submit internship requests and track their progress.

### 📜 **Document Management**
![Document Management](https://via.placeholder.com/800x400.png?text=Document+Management+Screenshot)

Easily manage, upload, and download documents related to the internship program.

### 📊 **Supervisor Dashboard**
![Supervisor Dashboard](https://via.placeholder.com/800x400.png?text=Supervisor+Dashboard+Screenshot)

The **Supervisor Dashboard** allows supervisors to approve or reject internship requests and generate reports.

---

## 🎥 **Demo Video**

Check out the video demo of the system to see it in action:

[Watch the Demo Video](#)  

---

## 🏗 **Project Structure**

### **Backend (Spring Boot)**

#### 1. **Config**
These configuration files handle everything from security settings to application constants.

- **SecurityConfig.java**: Configures Spring Security for authentication.
- **WebConfig.java**: General web configurations, including custom settings for request handling.
- **AppProperties.java**: Centralized application properties.

#### 2. **Controllers**
A controller for each major function of the system, with routes for authentication, internship management, and dashboards.

- **AuthController**: Login, logout, and password recovery.
- **InternController**: Handle intern CRUD operations.
- **DemandeController**: Manage internship requests (Demande).
- **Dashboard Controllers**:
  - **InternDashboardController**
  - **EncadrantDashboardController**
  - **ServiceAdminDashboardController**
  - **DCRHDashboardController**
  - **FormationCenterDashboardController**
- **DocumentController**: Manage document upload and download.
- **UserManagementController**: Admin functions for user creation and updates.

#### 3. **Entities**
Entities map the data model of the application to the database.

- **User**
- **Stagiaire (Intern)**
- **Demande (Internship Request)**
- **Document**
- **Role**

#### 4. **Repositories**
Spring Data repositories for CRUD operations on the entities.

- **UtilisateurRepository**: User repository.
- **StagiaireRepository**: Intern repository.
- **DemandeRepository**: Internship request repository.
- **DocumentRepository**: Document repository.
- **RoleRepository**: Role repository.

#### 5. **Security**
Security setup and JWT handling.

- **CustomUserDetailsService**: Custom service for user authentication.
- **JwtAuthenticationFilter**: JWT token filter.
- **JwtTokenUtil**: Utility class for JWT token generation/validation.
- **AuthenticationResponse**: Response structure after successful authentication.

#### 6. **Services**
Business logic layer, handling the main operations.

- **AuthService**: Handles login, token generation, etc.
- **InternService**: Manages intern operations.
- **ForumService**: Manages forum and request submissions.
- **Dashboard Services**: Role-specific services for dashboard functionalities.
- **DocumentService**: Document-related logic.
- **UserManagementService**: Handles user creation, modification, and deletion.

---

### **Frontend (Angular)**

#### 1. **Classes**
Data models representing entities in the frontend.

- **User**
- **Intern**
- **Demande**
- **Document**
- **Role**

#### 2. **Components**
Reusable UI components for user interactions.

##### Auth Components:
- **LoginComponent**: User login.
- **ForgetPasswordComponent**: Password recovery.

##### Forum Components:
- **ForumComponent**: Submitting and viewing internship requests.
- **ForumSentComponent**: View sent requests.

##### Dashboard Components:
- **Intern Dashboard**:
  - **InternDashboardComponent**: Intern-specific data.
  - **DemandeComponent**: Submit internship requests.
  - **DocumentsComponent**: View documents related to internship.
  - **FinStageComponent**: Internship completion tracking.

- **Encadrant Dashboard**:
  - **EncadrantDashboardComponent**: Supervisor’s overview.
  - **DemandeEnAttenteComponent**: Pending internship requests.
  - **DemandeValideeComponent**: Validated requests.
  - **RapportsComponent**: Generate reports for interns.

- **Service Administrative Dashboard**:
  - **ServiceAdminDashboardComponent**: Administrative control for managing users and services.
  - **ClassementNonComponent**: Pending classifications.
  - **ClassementOuiComponent**: Approved classifications.
  - **PriseServiceEnAttenteComponent**: Pending service assignments.
  - **BulletinEnAttenteComponent**: Pending bulletins.

- **DCRH Dashboard**:
  - **DCRHDashboardComponent**: Human Resources management.
  - **StagiaireEnAttenteComponent**: Interns pending validation.

- **Formation Center Dashboard**:
  - **FormationCenterDashboardComponent**: Formation center specific controls.
  - **ConvocationEnAttenteComponent**: Pending convocations.

##### Shared Components:
- **HeaderComponent**: The main header for navigation.
- **SidebarComponent**: Navigation sidebar for each role.
- **InternListComponent**: Display a list of interns.
- **InternInfoComponent**: Detailed view of a single intern.

#### 3. **Guards**
Guards to protect routes and ensure proper access control.

- **AuthGuard**: Protects routes requiring authentication.
- **RoleGuard**: Protects routes based on user roles (Admin, Supervisor, etc.).

#### 4. **Services**
Handles interaction with backend APIs and manages frontend data.

- **AuthService**: Authentication service.
- **InternService**: Manage intern data.
- **ForumService**: Manages forum-related data.
- **Dashboard Services**: Manages role-specific dashboard data.
- **DocumentService**: Manages document upload/download.

---

## ⚙️ **Setup Instructions**

### 1. **Clone the repository**
```bash
git clone https://github.com/CodeWizard-404/Circuit_De_Stage.git
```

### 2. **Backend (Spring Boot) Setup**

- Navigate to the `back-end` directory:
```bash
cd back-end
```

- Install and build the project using Maven:
```bash
mvn clean install
```

- Run the Spring Boot application:
```bash
mvn spring-boot:run
```

### 3. **Frontend (Angular) Setup**

- Navigate to the `front-end` directory:
```bash
cd front-end
```

- Install dependencies:
```bash
npm install
```

- Start the Angular application:
```bash
ng serve
```

---

## 📝 **License**

This project is licensed under the **---**. See the [---](LICENSE) file for more details.

---
