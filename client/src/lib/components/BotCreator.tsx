import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  PinInput,
  PinInputField,
  Radio,
  RadioGroup,
  Spacer,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BotConfig } from "../types/bot";
import DifficultyModal from "./DifficultyModal";

type BotCreatorProps = {
  handleSubmit: (
    roomCode: string,
    nickname: string,
    config: BotConfig,
    difficultyToken: string
  ) => void;
};

const DIFFICULTY: { [key: string]: BotConfig } = {
  easy: {
    typingSpeed: 50,
    errorRate: 10,
    thinkTime: 2,
  },
  hard: {
    typingSpeed: 150,
    errorRate: 5,
    thinkTime: 1,
  },
  unfair: {
    typingSpeed: 300,
    errorRate: 0,
    thinkTime: 0,
  },
};

const BotCreator = ({ handleSubmit }: BotCreatorProps) => {
  const [nickname, setNickname] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");

  const [config, setConfig] = useState<BotConfig>(DIFFICULTY.easy);
  const [difficultyToken, setDifficultyToken] = useState<string>("Easy");

  const [validNickname, setValidNickname] = useState<boolean>(false);
  const [validRoomCode, setValidRoomCode] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDifficultyChange = (difficultyToken: string) => {
    switch (difficultyToken) {
      case "Easy":
        setConfig(DIFFICULTY.easy);
        setDifficultyToken(() => "Easy");
        break;
      case "Hard":
        setConfig(DIFFICULTY.hard);
        setDifficultyToken(() => "Hard");
        break;
      case "Unfair":
        setConfig(DIFFICULTY.unfair);
        setDifficultyToken(() => "Unfair");
        break;
      case "Custom":
        onOpen();
        setDifficultyToken(() => "Custom");
        break;
    }
  };

  useEffect(() => {
    setValidNickname(nickname.length > 1 && nickname.length < 20);
  }, [nickname]);

  useEffect(() => {
    setValidRoomCode(roomCode.length === 4);
  }, [roomCode]);

  useEffect(() => {
    setRoomCode(roomCode.toUpperCase());
  }, [roomCode]);

  return (
    <Flex
      direction={"column"}
      bgColor={"white"}
      rounded={"md"}
      boxShadow={"md"}
      px={8}
      py={4}
    >
      <DifficultyModal
        isOpen={isOpen}
        onClose={onClose}
        config={config}
        setConfig={setConfig}
      />
      <Heading size={"md"} color={"purple.500"} pb={2}>
        Create a Bot
      </Heading>
      <FormControl isInvalid={!validRoomCode}>
        <FormLabel>Room Code:</FormLabel>
        <HStack spacing={2} pb={4}>
          <PinInput
            type="alphanumeric"
            onChange={(value) => setRoomCode(value)}
            value={roomCode}
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
      </FormControl>

      <FormControl isInvalid={!validNickname} pb={2}>
        <FormLabel>Nickname:</FormLabel>
        <Input
          placeholder="Finn the Human"
          minLength={2}
          maxLength={20}
          size="md"
          onChange={(e) => setNickname(e.target.value)}
          value={nickname}
          isInvalid={!validNickname}
        />
        {!validNickname && (
          <FormErrorMessage>
            Must be between 2 and 20 characters
          </FormErrorMessage>
        )}
      </FormControl>
      <FormLabel>Difficulty:</FormLabel>
      <RadioGroup
        defaultValue={"easy"}
        value={difficultyToken}
        onChange={(value) => handleDifficultyChange(value)}
        colorScheme={"purple"}
        pb={2}
      >
        <Stack direction={"row"}>
          <Radio value={"Easy"}>Easy</Radio>
          <Radio value={"Hard"}>Hard</Radio>
          <Radio value={"Unfair"}>Unfair</Radio>
          <Radio value={"Custom"}>Custom</Radio>
        </Stack>
      </RadioGroup>
      <Spacer pb={2} />
      <Button
        size={"md"}
        variant={"solid"}
        colorScheme="purple"
        onClick={() => {
          handleSubmit(roomCode, nickname, config, difficultyToken);
          setNickname("");
        }}
        disabled={!validRoomCode || !validNickname}
      >
        Go
      </Button>
    </Flex>
  );
};

export default BotCreator;
