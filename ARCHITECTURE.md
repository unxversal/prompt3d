# C3D Application Architecture

This document outlines the architecture of the C3D application, a modern, agentic, code-first CAD editor built with Next.js, React, and an AI agent powered by a large language model.

## 1. High-Level Overview

C3D allows users to generate and modify 3D Computer-Aided Design (CAD) models by interacting with an AI assistant in natural language. The AI agent interprets user requests, creates a plan, writes code using the `replicad` CAD library, and executes it to render a 3D model. The entire application is built on a modern web stack, designed to be performant, interactive, and intelligent.

## 2. Project Structure

The project follows a standard Next.js App Router structure. Key directories include:

-   `public/`: Contains static assets, including the `replicad_single.wasm` file required for the CAD engine.
-   `src/app/`: The core of the Next.js application.
    -   `page.tsx`: The main server component entry point. It dynamically loads the client-side application to prevent server-side rendering (SSR) of browser-specific APIs.
    -   `CADClientPage.tsx`: The main client component that orchestrates the entire UI, including the editor, viewer, and chat interface.
    -   `components/`: Contains all the React components for the UI.
        -   `CADViewer.tsx`: The 3D viewport using `react-three-fiber`.
        -   `ChatInterface.tsx`: The UI for interacting with the AI agent.
        -   Other components for layout and UI elements.
    -   `lib/`: Contains the core logic and utilities.
        -   `aiAgent.ts`: The heart of the AI agent, containing the logic for interacting with the LLM.
        -   `cadEngine.ts`: Manages the `replicad` CAD engine instance.
        -   `conversationStore.ts`: Handles client-side storage of conversations and settings using IndexedDB.
        -   `replicadDocs.ts`: A generated file containing the entire ReplicaD documentation as a TypeScript constant, used in the AI's system prompt.
    -   `types/`: Defines all TypeScript interfaces used across the application, especially for the AI agent (`ai.ts`).

## 3. Frontend & CAD Architecture

### Client-Side Rendering
The application heavily relies on client-side rendering due to its dependency on browser APIs like WebGL (for the 3D viewer) and WebAssembly (for the CAD engine). `page.tsx` acts as a server-side shell that dynamically imports `CADClientPage.tsx` with `ssr: false`.

### CAD Engine (`replicad`)
-   **Initialization**: The `replicad` WebAssembly module (`replicad_single.wasm`) is loaded and initialized in `useCADInitialization.ts`. This hook ensures the CAD kernel is ready before any operations are performed.
-   **Execution**: The `executeCode` function in `CADClientPage.tsx` takes the user's code, and (in a non-sandboxed environment) would `eval` it to generate `replicad` shapes. For security and stability, the current implementation uses a hardcoded example but is architected to support dynamic code execution.
-   **Rendering**: The generated `replicad` shapes are meshed and converted into a format compatible with Three.js using the `replicad-threejs-helper` library. These meshes are then passed to the `CADViewer` component.

### 3D Viewer (`react-three-fiber`)
-   The `CADViewer.tsx` component sets up a `Canvas` from `react-three-fiber`.
-   It renders the shapes it receives as props.
-   It includes `OrbitControls` for camera manipulation and a `Grid` for spatial reference.
-   A crucial part is the `CameraController` sub-component, which exposes a global `__CAD_CAMERA_CONTROLLER__` object. This controller is essential for the AI Agent's screenshot capability.

## 4. AI Agent Flow

This is the most complex part of the application. The flow is designed to create a loop where the AI can plan, act, and receive feedback until a task is complete.

**Key Files in the Flow:**
-   `CADClientPage.tsx`: Initiates the flow and integrates results (code changes).
-   `ChatInterface.tsx`: The UI for the flow, manages agent state, and handles function calls.
-   `aiAgent.ts`: Orchestrates the interaction with the LLM.
-   `types/ai.ts`: Defines the function schemas (tools) the AI can use.
-   `CADViewer.tsx`: Provides the screenshot functionality via the global controller.

### Step-by-Step Breakdown:

1.  **User Input**: The flow begins when a user sends a message through the `ChatInterface.tsx` component.

2.  **Triggering the Agent**: The `handleSubmit` function in `ChatInterface.tsx` is called. It:
    -   Adds the user's message to the conversation history.
    -   Sets the agent's state to `isProcessing`.
    -   Calls `agent.processUserMessage()`, passing the user's prompt and the current code from the editor.

3.  **Context Assembly (`aiAgent.ts`)**: The `processUserMessage` function assembles a rich context to send to the LLM. This includes:
    -   **System Prompt**: A detailed prompt created by `createSystemPrompt()`. It defines the AI's persona ("C3D"), its capabilities, the tools it can use, and the **entire ReplicaD documentation** from `replicadDocs.ts`.
    -   **Conversation History**: Provides the context of the current interaction.
    -   **Current Code**: The full content of the code editor.
    -   **Visual Context**: The agent calls `captureViewportScreenshots()`.

4.  **Screenshot Capture (`CADViewer.tsx` -> `aiAgent.ts`)**:
    -   The `captureViewportScreenshots` function in `aiAgent.ts` accesses the `__CAD_CAMERA_CONTROLLER__` exposed by `CADViewer.tsx`.
    -   It calls the controller's `moveToView` function, which smoothly animates the camera to four positions: front, back, left, and right.
    -   After each animation, it captures the 3D canvas content as a data URL.
    -   The camera is then smoothly returned to its original position.
    -   These screenshots (or just a text description of them) are added to the prompt.

5.  **LLM Interaction Loop (`aiAgent.ts`)**:
    -   The agent sends the assembled context to the LLM via the `openai.chat.completions.create` method, including the list of available `tools` from `types/ai.ts`.
    -   The agent enters a `while` loop that continues until the AI decides the task is finished (by calling `complete_task`) or a timeout is reached.
    -   In each loop iteration, the LLM can respond with either a text message or a request to call one or more functions (`tool_calls`).

6.  **Function Call Handling (`ChatInterface.tsx`)**:
    -   When the LLM requests a function call, the `onFunctionCall` callback (which points to `handleFunctionCall` in `ChatInterface.tsx`) is executed.
    -   A `switch` statement routes the call to the appropriate handler:
        -   `handleNotifyUser`: Sends a message to the user UI and shows a toast in collapsed mode.
        -   `handleSendPlan` / `handleUpdatePlan`: Renders the AI's plan in the chat UI.
        -   `handleWriteCode` / `handleUpdateCode`: This is a critical step. The handler updates the code in the editor via `onCodeChange` and then calls `onCodeExecute` (which is the `executeCode` function from `CADClientPage.tsx`). This **triggers the execution of the new code**, re-rendering the 3D model.
        -   `handleCompleteTask`: Informs the user the task is done and sets a flag to break the agent's processing loop.

7.  **Feeding Back Results**: The output of the executed function (e.g., "Code updated successfully") is packaged into a "tool" role message and sent back to the LLM in the next iteration of the loop. This feedback mechanism allows the AI to confirm its actions were successful and decide on the next step.

8.  **UI Updates**: Throughout this process, `ChatInterface.tsx` uses its local `agentState` to render status indicators, such as a "Processing..." message with the name of the function currently being executed, and displays the AI's active plan in a banner. This provides the user with transparent, real-time feedback on the agent's activity.

This architecture creates a powerful, agentic system where the AI can reason, plan, and act within the application's environment, directly manipulating the core content (the CAD code) to fulfill user requests. 