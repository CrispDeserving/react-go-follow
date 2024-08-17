import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import TodoItem, { Todo } from "./TodoItem";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../App";

type GetTodoResponse = {
  count: number;
  todos: Todo[];
};

const TodoList = () => {
  const { data: todosResponse, isLoading } = useQuery<GetTodoResponse>({
    queryKey: ["todos"],
    queryFn: async () => {
      try {
        const response = await fetch(`${BASE_URL}/todos`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data || [];
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <>
      <Text
        fontSize={"4xl"}
        textTransform={"uppercase"}
        fontWeight={"bold"}
        textAlign={"center"}
        my={2}
        bgGradient="linear(to-l, #0b85f8, #00ffff)"
        bgClip="text"
      >
        Today's Tasks
      </Text>
      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {!isLoading && todosResponse?.todos == null && (
        <Stack alignItems={"center"} gap="3">
          <img src="/go.png" alt="Go logo" width={70} height={70} />
          <Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
            All tasks completed! 🤞
          </Text>
        </Stack>
      )}
      <Stack gap={3}>
        {todosResponse?.todos?.map((todo) => (
          <TodoItem key={todo._id} todo={todo} />
        ))}
      </Stack>
    </>
  );
};
export default TodoList;
