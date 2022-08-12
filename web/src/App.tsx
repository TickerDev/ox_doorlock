import { Box, createStyles, Transition } from '@mantine/core';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useNuiEvent } from './hooks/useNuiEvent';
import { defaultState, StoreState, useSetters, useStore } from './store';
import Doors from './layouts/doors';
import Settings from './layouts/settings';
import { useVisibility } from './store/visibility';
import { useExitListener } from './hooks/useExitListener';
import { useDoors } from './store/doors';
import { DoorColumn } from './store/doors';
import { convertData } from './utils/convertData';

const useStyles = createStyles((theme) => ({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  main: {
    width: 700,
    height: 500,
    backgroundColor: theme.colors.dark[8],
    borderRadius: theme.radius.sm,
  },

  search: {
    width: '40%',
    transition: '300ms',
    '&:focus-within': {
      width: '50%',
    },
  },
}));

const App: React.FC = () => {
  const { classes } = useStyles();
  const setSounds = useSetters((setter) => setter.setSounds);
  const [visible, setVisible] = useVisibility((state) => [state.visible, state.setVisible]);
  const setDoors = useDoors((state) => state.setDoors);
  const navigate = useNavigate();

  useNuiEvent('playSound', async (data: { sound: string; volume: number }) => {
    const sound = new Audio(`./sounds/${data.sound}.ogg`);
    sound.volume = data.volume;
    await sound.play();
  });

  useNuiEvent('setSoundFiles', (data: string[]) => setSounds(data));

  useNuiEvent('setVisible', (data: DoorColumn | { [key: string]: DoorColumn }) => {
    setVisible(true);
    // Doors data for the table is passed
    if (!isNaN(parseInt(Object.keys(data)[0]))) return setDoors(Object.values(data));
    // Single door object data so move to settings
    navigate('/settings/general');
    // @ts-ignore
    return useStore.setState(convertData(data), true);
  });

  useExitListener(setVisible);

  return (
    <Box className={classes.container}>
      <Transition transition="slide-up" mounted={visible}>
        {(style) => (
          <Box className={classes.main} style={style}>
            <Routes>
              <Route path="/" element={<Doors />} />
              <Route path="/settings/*" element={<Settings />} />
            </Routes>
          </Box>
        )}
      </Transition>
    </Box>
  );
};

export default App;
