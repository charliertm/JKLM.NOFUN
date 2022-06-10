import {
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { useState } from "react";
import BotsBar from "../../components/BotsBar";
import { BotData } from "../../types/bot";

const Home = () => {
  const [roomCode, setRoomCode] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [bots, setBots] = useState<BotData[]>([]);

  const deleteBot = async (id: string) => {
    const requestOptions: RequestInit = {
      method: "DELETE",
      mode: "cors",
      credentials: "same-origin",
    };
    try {
      const response = await fetch(
        `http://localhost:3333/bot/${id}/`,
        requestOptions
      );
      const responseData = (await response.json()) as { id: string };
      const deletedId = responseData.id;
      const newBots = bots.filter((bot) => deletedId !== bot.id);
      console.log(newBots);
      setBots(newBots);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    const requestOptions: RequestInit = {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomCode: roomCode, nickname: nickname }),
    };
    const response = await fetch("http://localhost:3333/bots", requestOptions);
    const botData = await response.json();
    setBots((prev) => [...prev, botData]);
    setNickname("");
  };

  return (
    <Flex
      direction={"column"}
      h={"100vh"}
      w="100vw"
      align={"center"}
      justify={"space-evenly"}
      bgColor={"pink.100"}
    >
      <Flex
        direction={"column"}
        textAlign={"center"}
        bgColor={"gray.50"}
        p={8}
        rounded={"md"}
      >
        <Heading pb={4} color={"red.500"}>
          ROOM CODE
        </Heading>
        <HStack spacing={4} pb={4}>
          <PinInput
            type="alphanumeric"
            onChange={(value) => setRoomCode(value)}
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
        <Input
          placeholder="nickname"
          size="md"
          onChange={(e) => setNickname(e.target.value)}
          value={nickname}
          mb={4}
        />
        <Button
          size={"md"}
          variant={"solid"}
          colorScheme="pink"
          onClick={() => handleSubmit()}
        >
          CREATE BOT
        </Button>
      </Flex>
      <BotsBar bots={bots} handleDelete={deleteBot} />
    </Flex>
  );
};

export default Home;
