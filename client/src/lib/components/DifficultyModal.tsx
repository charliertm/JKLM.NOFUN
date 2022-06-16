import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { BotConfig } from "../types/bot";

interface SliderWithToolTipProps extends SliderProps {
  sliderValue: number;
  setSliderValue: (value: number) => void;
  postfix?: string;
}

const SliderWithToolTip = ({
  sliderValue,
  setSliderValue,
  postfix = "",
  ...props
}: SliderWithToolTipProps) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <Slider
      onChange={(v) => setSliderValue(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg={props.colorScheme ? props.colorScheme + ".500" : "gray.800"}
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${sliderValue}${postfix}`}
      >
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
};

const DifficultyModal = ({
  isOpen,
  onClose,
  config,
  setConfig,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig;
  setConfig: Dispatch<SetStateAction<BotConfig>>;
}) => {
  const { typingSpeed, errorRate, thinkTime } = config;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Custom Difficulty</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Typing Speed:</FormLabel>
            <FormHelperText>{`${config.typingSpeed}WPM`}</FormHelperText>
            <SliderWithToolTip
              sliderValue={typingSpeed}
              setSliderValue={(value) =>
                setConfig({ ...config, typingSpeed: value })
              }
              colorScheme={"pink"}
              postfix={"WPM"}
              defaultValue={typingSpeed}
              min={10}
              max={300}
              step={1}
            />
            <FormLabel>Error Rate:</FormLabel>
            <FormHelperText>{`${config.errorRate}%`}</FormHelperText>
            <SliderWithToolTip
              sliderValue={errorRate}
              setSliderValue={(value) =>
                setConfig({ ...config, errorRate: value })
              }
              colorScheme={"yellow"}
              postfix={"%"}
              defaultValue={errorRate}
              min={0}
              max={1}
              step={0.01}
            />
            <FormLabel>Think time:</FormLabel>
            <FormHelperText>{`${config.thinkTime}s`}</FormHelperText>
            <SliderWithToolTip
              sliderValue={thinkTime}
              setSliderValue={(value) =>
                setConfig({ ...config, thinkTime: value })
              }
              colorScheme={"cyan"}
              defaultValue={thinkTime}
              postfix={"s"}
              min={0}
              max={5}
              step={0.05}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="purple" mr={2} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DifficultyModal;
