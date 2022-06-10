import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { BotData } from "../types/bot";

const BotCard = ({
  bot,
  handleDelete,
}: {
  bot: BotData;
  handleDelete: (id: string) => void;
}) => {
  const { id, nickname, roomCode } = bot;
  return (
    <Flex
      direction={"column"}
      bgColor={"pink.500"}
      rounded="md"
      minW={"10em"}
      p={4}
      align={"center"}
      textAlign={"center"}
      justifyContent="space-around"
    >
      <Heading color="white">{nickname}</Heading>
      <Text color={"white"}>{roomCode}</Text>
      <Button onClick={() => handleDelete(id)}>DELETE</Button>
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
    <Flex direction={"column"}>
      <Heading color="red.500">Active Bots: </Heading>
      <Flex
        direction={"row"}
        minH={"30vh"}
        minW={"container.sm"}
        justify={"space-evenly"}
        bgColor={"white"}
        rounded="md"
        p={4}
      >
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} handleDelete={handleDelete} />
        ))}
      </Flex>
    </Flex>
  );
};

export default BotsBar;
