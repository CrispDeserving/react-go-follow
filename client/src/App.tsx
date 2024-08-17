import { Container, Stack } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

export const BASE_URL =
  import.meta.env.MODE !== "production" ? "http://localhost:5000/api" : "/api";

function App() {
  return (
    <Stack h="100vh" w="100vw" padding={5}>
      <NavBar />
      <Container>
        <TodoForm />
        <TodoList />
      </Container>
    </Stack>
  );
}

export default App;
