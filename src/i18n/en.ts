// English translations
export const en = {
    // General
    app_name: 'Munchkin Tracker',
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    close: 'Close',
    back: 'Back',

    // Home screen
    home_title: 'Munchkin Tracker',
    create_game: 'Create Game',
    join_game: 'Join Game',
    settings: 'Settings',

    // Lobby
    lobby_title: 'Lobby',
    waiting_players: 'Waiting for players...',
    player_count: '{count} of {max} players',
    start_game: 'Start Game',
    leave_game: 'Leave',
    you_are_host: 'You are the host',
    scan_to_join: 'Scan to join',

    // Game
    level: 'Level',
    gear: 'Gear',
    combat_strength: 'Combat Strength',
    race: 'Race',
    class: 'Class',
    no_race: 'Human',
    no_class: 'No Class',
    your_turn: 'Your turn!',

    // Combat
    combat_title: 'Combat',
    start_combat: 'Start Combat',
    add_monster: 'Add Monster',
    add_helper: 'Add Helper',
    player_side: 'Players',
    monster_side: 'Monsters',
    total_strength: 'Total Strength',
    victory: 'Victory!',
    defeat: 'Defeat',
    flee: 'Run Away',
    resolve_combat: 'Resolve Combat',

    // Monster
    monster_level: 'Level {level}',
    monster_treasures: '{count} treasures',
    monster_levels: '+{count} levels',
    bad_stuff: 'Bad Stuff',
    bonuses: 'Bonuses',

    // Player setup
    enter_name: 'Enter your name',
    player_name: 'Player name',
    select_race: 'Select Race',
    select_class: 'Select Class',

    // Network
    searching_games: 'Searching for games...',
    no_games_found: 'No games found',
    connection_error: 'Connection error',
    reconnecting: 'Reconnecting...',
    host_left: 'The host has left the game',

    // Updates
    update_available: 'Update available',
    update_version: 'New version: {version}',
    update_now: 'Update now',
    update_later: 'Later',
    checking_updates: 'Checking for updates...',
    downloading_update: 'Downloading update...',

    // Settings
    settings_title: 'Settings',
    check_updates: 'Check for updates',
    manage_monsters: 'Manage monsters',
    about: 'About',
    version: 'Version {version}',

    // Monster scanner
    scan_monster: 'Scan Card',
    scanning: 'Scanning...',
    scan_instructions: 'Focus on the monster card',
    add_manually: 'Add manually',
    monster_name: 'Monster name',
    monster_power: 'Monster level',
    monster_bad_stuff: 'Bad stuff',

    // Races
    race_human: 'Human',
    race_elf: 'Elf',
    race_dwarf: 'Dwarf',
    race_halfling: 'Halfling',
    race_orc: 'Orc',
    race_gnome: 'Gnome',

    // Classes
    class_warrior: 'Warrior',
    class_wizard: 'Wizard',
    class_cleric: 'Cleric',
    class_thief: 'Thief',
    class_bard: 'Bard',
    class_ranger: 'Ranger',

    // Game end
    game_over: 'Game Over',
    winner: '{name} wins!',
    play_again: 'Play again',

    // Stats
    stats_title: 'Statistics',
    stats_luckiest: 'Luckiest player',
    stats_wins: 'Wins',
    stats_losses: 'Losses',
    stats_monsters: 'Monsters defeated',
    stats_highest_level: 'Highest level',
    stats_games_played: 'Games played',
    stats_recent_games: 'Recent games',
    stats_empty: 'No stats yet',
    stats_play_hint: 'Play some games to see your rankings',

    // Curses
    curse_active: 'Active curse',
    curse_removed: 'Curse removed',
    curse_flee_penalty: 'Flee penalty',
    curse_combat_penalty: 'Combat penalty',
    curse_add: 'Add curse',
    curse_remove: 'Remove curse',

    // Abilities
    ability_race: 'Race ability',
    ability_class: 'Class ability',
    ability_elf_flee: 'Elf: +1 to run away',
    ability_warrior_tie: 'Warrior: Ties win',
    ability_cleric_undead: 'Cleric: +3 vs Undead',
    ability_orc_kills: 'Orc: +{count} (monsters killed)',

    // History
    history_title: 'Game History',
    history_empty: 'No games recorded',
    history_players: '{count} players',
    history_duration: 'Duration: {duration}',

    // Errors
    error_connection: 'Could not connect',
    error_game_full: 'Game is full',
    error_game_started: 'Game has already started',
    error_invalid_name: 'Invalid name',
};

export type TranslationKeyEN = keyof typeof en;
