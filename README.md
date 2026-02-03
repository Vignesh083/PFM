# PFM
Your personal finance manager

## Run and debug

### Backend (Spring Boot, port 9006)

**Prerequisites:** Java 17+, Maven (or use IDE’s embedded Maven). MySQL running with DB from `application.yaml`.

| IDE / method | How to run or debug |
|--------------|----------------------|
| **VS Code / Cursor** | Open the project → **Run and Debug** (Ctrl+Shift+D) → choose **"Debug Spring Boot (StartApplication)"** → F5. Or right‑click `StartApplication.java` → **Debug Java**. |
| **IntelliJ IDEA** | Open the project (Open → select folder with `pom.xml`). Right‑click `StartApplication.java` → **Run 'StartApplication'** or **Debug 'StartApplication'**. Or use the green run icon next to `main`. |
| **Eclipse** | **File → Import → Maven → Existing Maven Projects** → select project folder. Right‑click project → **Run As → Spring Boot App** (or **Debug As**). |
| **Command line** | `mvn spring-boot:run` (from project root). To debug: `mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005"` then attach your IDE to port 5005. |

### Frontend (React, port 5173)

**Prerequisites:** Node.js and npm. Start the backend first.

| IDE / method | How to run or debug |
|--------------|----------------------|
| **Any** | `cd frontend` → `npm install` → `npm run dev`. Open http://localhost:5173. |
| **VS Code / Cursor** | After `npm run dev`, use **"Debug Frontend (Chrome)"** in Run and Debug to attach Chrome for frontend debugging (requires "Debugger for Chrome" / "JavaScript Debugger" extension). |

### Quick test

1. Start backend (IDE or `mvn spring-boot:run`).
2. Start frontend: `cd frontend && npm install && npm run dev`.
3. Open http://localhost:5173 → Login or Register.
