import type { Component } from 'solid-js';
import Minesweeper from './Minesweeper';

import styles from './styles/App.module.css';

const App: Component = () => {

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        Hello Unsmart Minesweeper
      </header>
      <div>
        <Minesweeper ></Minesweeper>
      </div>
    </div>
  );
};

export default App;
