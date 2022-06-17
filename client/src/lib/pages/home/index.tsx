import { Flex, useToast } from "@chakra-ui/react";
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { useState } from "react";
import BotCreator from "../../components/BotCreator";
import BotsBar from "../../components/BotsBar";
import { BotConfig, BotData } from "../../types/bot";

const Home = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const toast = useToast();

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
      setBots(newBots);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async (
    roomCode: string,
    nickname: string,
    config: BotConfig,
    difficultyToken: string
  ) => {
    const requestOptions: RequestInit = {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomCode: roomCode,
        nickname: nickname,
        config: config,
      }),
    };
    const response = await fetch("http://localhost:3333/bots", requestOptions);
    if (response.status === 400) {
      toast({
        title: "Invalid Room Code",
        status: "error",
        isClosable: true,
      });
      return;
    }
    const botData = await response.json();
    setBots((prev) => [
      ...prev,
      { ...botData, difficultyToken: difficultyToken },
    ]);
    toast({
      title: "Bot Created",
      status: "success",
      isClosable: true,
    });
  };

  return (
    <Flex
      direction={"column"}
      h={"100vh"}
      w="100vw"
      align={"center"}
      justify={"space-evenly"}
      bgColor={"gray.50"}
    >
      <BotCreator handleSubmit={handleSubmit} />
      <BotsBar bots={bots} handleDelete={deleteBot} />
    </Flex>
  );
};

export default Home;
