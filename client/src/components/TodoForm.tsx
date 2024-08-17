import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";

const TodoForm = () => {
  const [newTodo, setNewTodo] = useState("");
  const queryClient = useQueryClient();

  const { mutate: createTodo, isPending: isCreatingTodo } = useMutation({
    mutationKey: ["createTodo"],
    mutationFn: async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        const response = await fetch(`${BASE_URL}/todos/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: newTodo }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setNewTodo("");
        return data?.todo;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <form onSubmit={createTodo}>
      <Flex gap={2}>
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          ref={(input) => input && input.focus()}
        />
        <Button
          mx={2}
          type="submit"
          onSubmit={createTodo}
          _active={{
            transform: "scale(.97)",
          }}
        >
          {isCreatingTodo ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
        </Button>
      </Flex>
    </form>
  );
};
export default TodoForm;
