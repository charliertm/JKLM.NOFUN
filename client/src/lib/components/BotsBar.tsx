import { DeleteIcon } from "@chakra-ui/icons";
import { Flex, Heading, IconButton, Tag, Text } from "@chakra-ui/react";
import { BotData } from "../types/bot";

const BotCard = ({
  bot,
  handleDelete,
}: {
  bot: BotData;
  handleDelete: (id: string) => void;
}) => {
  const { id, nickname, roomCode, difficultyToken } = bot;
  return (
    <Flex
      direction={"row"}
      bgColor={"purple.500"}
      rounded="md"
      boxShadow={"md"}
      minW={"16em"}
      justify={"space-between"}
      align={"center"}
      p={4}
      mr={2}
    >
      <Flex
        direction={"column"}
        align={"center"}
        textAlign={"center"}
        justifyContent="space-around"
      >
        <Heading color="white" size={"md"}>
          {nickname}
        </Heading>
        <Text color={"white"}>{roomCode}</Text>
      </Flex>
      <Tag>{difficultyToken}</Tag>
      <IconButton
        aria-label="delete"
        icon={<DeleteIcon />}
        color={"white"}
        variant={"ghost"}
        size={"lg"}
        onClick={() => handleDelete(id)}
      />
    </Flex>
  );
};

const BotsBar = ({
  bots,
  handleDelete,
}: {
  bots: BotData[];
  handleDelete: (id: string) => void;
}) => {
  return (
    <Flex direction={"column"} bgColor={"white"} rounded="md" boxShadow={"md"}>
      <Heading color={"purple.500"} size={"md"} p={4}>
        Active Bots:
      </Heading>
      <Flex
        direction={"row"}
        minH={"20vh"}
        minW={"container.lg"}
        justify={"start"}
        px={4}
        pb={8}
      >
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} handleDelete={handleDelete} />
        ))}
      </Flex>
    </Flex>
  );
};

export default BotsBar;
