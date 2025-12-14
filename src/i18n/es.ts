// Spanish translations
export const es = {
    // General
    app_name: 'Munchkin Tracker',
    loading: 'Cargando...',
    error: 'Error',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    close: 'Cerrar',
    back: 'Volver',

    // Home screen
    home_title: 'Munchkin Tracker',
    create_game: 'Crear Partida',
    join_game: 'Unirse a Partida',
    settings: 'Ajustes',

    // Lobby
    lobby_title: 'Sala de Espera',
    waiting_players: 'Esperando jugadores...',
    player_count: '{count} de {max} jugadores',
    start_game: 'Iniciar Partida',
    leave_game: 'Abandonar',
    you_are_host: 'Eres el anfitrión',
    scan_to_join: 'Escanea para unirte',

    // Game
    level: 'Nivel',
    gear: 'Equipo',
    combat_strength: 'Fuerza de Combate',
    race: 'Raza',
    class: 'Clase',
    no_race: 'Humano',
    no_class: 'Sin Clase',
    your_turn: '¡Tu turno!',

    // Combat
    combat_title: 'Combate',
    start_combat: 'Iniciar Combate',
    add_monster: 'Añadir Monstruo',
    add_helper: 'Añadir Ayudante',
    player_side: 'Jugadores',
    monster_side: 'Monstruos',
    total_strength: 'Fuerza Total',
    victory: '¡Victoria!',
    defeat: 'Derrota',
    flee: 'Huir',
    resolve_combat: 'Resolver Combate',

    // Monster
    monster_level: 'Nivel {level}',
    monster_treasures: '{count} tesoros',
    monster_levels: '+{count} niveles',
    bad_stuff: 'Mal Rollo',
    bonuses: 'Bonificaciones',

    // Player setup
    enter_name: 'Introduce tu nombre',
    player_name: 'Nombre del jugador',
    select_race: 'Seleccionar Raza',
    select_class: 'Seleccionar Clase',

    // Network
    searching_games: 'Buscando partidas...',
    no_games_found: 'No se encontraron partidas',
    connection_error: 'Error de conexión',
    reconnecting: 'Reconectando...',
    host_left: 'El anfitrión ha abandonado la partida',

    // Updates
    update_available: 'Actualización disponible',
    update_version: 'Nueva versión: {version}',
    update_now: 'Actualizar ahora',
    update_later: 'Más tarde',
    checking_updates: 'Comprobando actualizaciones...',
    downloading_update: 'Descargando actualización...',

    // Settings
    settings_title: 'Ajustes',
    check_updates: 'Comprobar actualizaciones',
    manage_monsters: 'Gestionar monstruos',
    about: 'Acerca de',
    version: 'Versión {version}',

    // Monster scanner
    scan_monster: 'Escanear Carta',
    scanning: 'Escaneando...',
    scan_instructions: 'Enfoca la carta del monstruo',
    add_manually: 'Añadir manualmente',
    monster_name: 'Nombre del monstruo',
    monster_power: 'Nivel del monstruo',
    monster_bad_stuff: 'Mal rollo',

    // Races
    race_human: 'Humano',
    race_elf: 'Elfo',
    race_dwarf: 'Enano',
    race_halfling: 'Mediano',
    race_orc: 'Orco',
    race_gnome: 'Gnomo',

    // Classes
    class_warrior: 'Guerrero',
    class_wizard: 'Mago',
    class_cleric: 'Clérigo',
    class_thief: 'Ladrón',
    class_bard: 'Bardo',
    class_ranger: 'Explorador',

    // Game end
    game_over: 'Fin de la Partida',
    winner: '¡{name} ha ganado!',
    play_again: 'Jugar de nuevo',

    // Stats
    stats_title: 'Estadísticas',
    stats_luckiest: 'Jugador con más suerte',
    stats_wins: 'Victorias',
    stats_losses: 'Derrotas',
    stats_monsters: 'Monstruos derrotados',
    stats_highest_level: 'Nivel máximo',
    stats_games_played: 'Partidas jugadas',
    stats_recent_games: 'Partidas recientes',
    stats_empty: 'Aún no hay estadísticas',
    stats_play_hint: 'Juega algunas partidas para ver tus rankings',

    // Curses
    curse_active: 'Maldición activa',
    curse_removed: 'Maldición eliminada',
    curse_flee_penalty: 'Penalización a huir',
    curse_combat_penalty: 'Penalización en combate',
    curse_add: 'Añadir maldición',
    curse_remove: 'Quitar maldición',

    // Abilities
    ability_race: 'Habilidad de raza',
    ability_class: 'Habilidad de clase',
    ability_elf_flee: 'Elfo: +1 para huir',
    ability_warrior_tie: 'Guerrero: Empates ganan',
    ability_cleric_undead: 'Clérigo: +3 vs No Muertos',
    ability_orc_kills: 'Orco: +{count} (monstruos derrotados)',

    // History
    history_title: 'Historial de Partidas',
    history_empty: 'No hay partidas registradas',
    history_players: '{count} jugadores',
    history_duration: 'Duración: {duration}',

    // Errors
    error_connection: 'No se pudo conectar',
    error_game_full: 'La partida está llena',
    error_game_started: 'La partida ya ha empezado',
    error_invalid_name: 'Nombre no válido',
};

export type TranslationKey = keyof typeof es;

// i18n helper function
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = es[key] || key;

    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
        });
    }

    return text;
}
