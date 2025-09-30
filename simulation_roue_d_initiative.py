import random
from typing import List, Dict


# ====== Base classes ======

class Pawn:
    """Un pion sur la roue."""
    def __init__(self, name: str, speed: int, is_player: bool = False):
        self.name = name
        self.speed = speed
        self.pos = 0
        self.old_pos = 0
        self.is_player = is_player

    def move(self) -> Dict:
        """Retourne les infos de déplacement (steps, tours, old_pos, new_pos)."""
        steps = max(0, 1 + self.speed)  # vitesse négative => bloqué
        self.old_pos = self.pos
        self.pos = self.pos + steps

    def __repr__(self):
        return f"{self.name}(pos={self.pos}, vit={self.speed})"


class Player(Pawn):
    def __init__(self, name: str, speed: int):
        super().__init__(name, speed, is_player=True)


class Enemy(Pawn):
    def __init__(self, name: str, speed: int):
        super().__init__(name, speed, is_player=False)


# ====== Wheel ======

class Wheel:
    """La roue circulaire."""
    def __init__(self, size: int = 6):
        self.size = size
        self.pawns: List[Pawn] = []

    def add_pawn(self, pawn: Pawn):
        self.pawns.append(pawn)

    def get_state(self) -> Dict[int, List[str]]:
        """Renvoie l’état de la roue (qui est sur quelle case)."""
        grid = {i: [] for i in range(self.size)}
        for p in self.pawns:
            grid[p.pos % self.size].append(p.name)
        return grid

    def display(self, turn: int):
        """Affiche l’état de la roue."""
        print(f"\nÉtat de la roue (tour global {turn}):")
        state = self.get_state()
        for i in range(self.size):
            case = state[i]
            print(f"Case {i}: {', '.join(case) if case else '-'}")


# ====== Turn ======

class Turn:
    """Un tour global (ordre + déplacements + dépassements)."""
    def __init__(self, turn_number: int, wheel: Wheel):
        self.number = turn_number
        self.wheel = wheel
        self.events: List[str] = []

    def execute(self):

        # Déplacements
        for pawn in self.wheel.pawns:
            pawn.move()

        # Dépassements (sauf au tour 1)
        if self.number > 1:
            self.check_overtakes()

        # Affichage roue
        self.wheel.display(self.number)

    def check_overtakes(self):
        """Vérifie les dépassements et actions bonus."""
        sorted_pawns = sorted(self.wheel.pawns, key=lambda p: p.pos % 6, reverse=True)
        for pawn in sorted_pawns:
            for otherPawn in self.wheel.pawns:
                if pawn.pos != pawn.old_pos and otherPawn.is_player != pawn.is_player and pawn.pos >= otherPawn.pos and pawn.old_pos < otherPawn.old_pos:
                    print("{:<10} joue (doublement de {})".format(pawn.name, otherPawn.name))
            print("{:<10} joue".format(pawn.name))


# ====== Game ======

class Game:
    """Gère plusieurs tours et l’historique complet."""
    def __init__(self, wheel: Wheel):
        self.wheel = wheel
        self.turns: List[Turn] = []
        self.wheel.display(turn=0)

    def turn(self):
        # état initial
        turn = Turn(len(self.turns) + 2, self.wheel)
        turn.execute()
        self.turns.append(turn)


# ====== Simulation ======

wheel = Wheel()

# 2 joueurs + 4 ennemis
wheel.add_pawn(Player("PJ1", speed=2))
wheel.add_pawn(Player("PJ2", speed=1))
wheel.add_pawn(Enemy("Ennemi A", speed=3))
wheel.add_pawn(Enemy("Ennemi B", speed=2))
wheel.add_pawn(Enemy("Ennemi C", speed=1))
wheel.add_pawn(Enemy("Ennemi D", speed=-1))  # bloqué

game = Game(wheel)
game.turn()
game.turn()
