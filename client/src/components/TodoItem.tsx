import {
  Badge,
  Box,
  Flex,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BASE_URL } from "../App";

export type Todo = {
  _id: string;
  body: string;
  completed: boolean;
};

const TodoItem = ({ todo }: { todo: Todo }) => {
  const queryClient = useQueryClient();

  const { mutate: updateTodo, isPending: isUpdatingTodo } = useMutation({
    mutationKey: ["updateTodo"],
    mutationFn: async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/todos/${todo._id}/completion`,
          {
            method: "PATCH",
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data?.todo;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const { mutate: deleteTodo, isPending: isDeletingTodo } = useMutation({
    mutationKey: ["deleteTodo"],
    mutationFn: async () => {
      try {
        const response = await fetch(`${BASE_URL}/todos/${todo._id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const progressTextColor = useColorModeValue("yellow.300", "yellow.100");
  const completedTextColor = useColorModeValue("green.500", "green.200");

  return (
    <Flex gap={2} alignItems={"center"}>
      <Flex
        flex={1}
        alignItems={"center"}
        border={"1px"}
        borderColor={"gray.600"}
        p={2}
        borderRadius={"lg"}
        justifyContent={"space-between"}
      >
        <Text
          color={todo.completed ? completedTextColor : progressTextColor}
          textDecoration={todo.completed ? "line-through" : "none"}
        >
          {todo.body}
        </Text>
        {todo.completed ? (
          <Badge ml="1" colorScheme="green">
            Done
          </Badge>
        ) : (
          <Badge ml="1" colorScheme="yellow">
            In Progress
          </Badge>
        )}
      </Flex>
      <Flex gap={2} alignItems={"center"}>
        <Box
          color={"green.500"}
          cursor={"pointer"}
          onClick={() => updateTodo()}
        >
          {isUpdatingTodo ? <Spinner size="sm" /> : <FaCheckCircle size={20} />}
        </Box>
        <Box color={"red.500"} cursor={"pointer"} onClick={() => deleteTodo()}>
          {isDeletingTodo ? <Spinner size="sm" /> : <MdDelete size={25} />}
        </Box>
      </Flex>
    </Flex>
  );
};
export default TodoItem;
