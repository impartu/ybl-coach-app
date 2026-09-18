import { Player } from './types';

export const INITIAL_ROSTER: Player[] = [
  { id: 'p1', name: 'Max Saksouk', jersey: '1', number: '1', height: "4'11\"", roles: ['R'], defense: 'A', isAvailable: true, isActiveOnRoster: true, code: "4'11\" R A" },
  { id: 'p2', name: 'James Nishimura', jersey: '2', number: '2', height: "5'1\"", roles: ['R', 'H'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "5'1\" RH B" },
  { id: 'p3', name: 'Calvin Helms', jersey: '3', number: '3', height: "4'5\"", roles: ['H'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'5\" H B" },
  { id: 'p4', name: 'Dilan Sech', jersey: '4', number: '4', height: "4'6\"", roles: ['H', 'C'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'6\" HC B" },
  { id: 'p5', name: 'Aydin Sheykhina', jersey: '5', number: '5', height: "4'4\"", roles: ['C', 'H'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'4\" CH B" },
  { id: 'p6', name: 'Asher Klein', jersey: '7', number: '7', height: "4'9\"", roles: ['C'], defense: 'D', isAvailable: true, isActiveOnRoster: true, code: "4'9\" C D" },
  { id: 'p7', name: 'Daniel Soltani', jersey: '7', number: '7', height: "4'7\"", roles: ['C'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'7\" C B" },
  { id: 'p8', name: 'Raeen Dehghani', jersey: '8', number: '8', height: "4'7\"", roles: ['C'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'7\" C B" },
  { id: 'p9', name: 'Wyatt Gladis', jersey: '9', number: '9', height: "4'3\"", roles: ['C'], defense: 'C', isAvailable: true, isActiveOnRoster: true, code: "4'3\" C C" },
  { id: 'p10', name: 'Player 10', jersey: '10', number: '10', height: "4'6\"", roles: ['C'], defense: 'B', isAvailable: true, isActiveOnRoster: true, code: "4'6\" C B" },
];

export const INITIAL_PLAYERS: Player[] = INITIAL_ROSTER;

export const PERIOD_NAMES = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'];