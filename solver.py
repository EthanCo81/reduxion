#!/usr/bin/env python3
"""
Reduxion Game Solver
Finds the minimum number of steps to reach a target number from a starting number.
"""

import math
from collections import deque
from typing import List, Tuple, Optional, Set


def is_perfect_square(n: int) -> bool:
    """Check if a number is a perfect square."""
    if n < 0:
        return False
    sqrt = int(math.sqrt(n))
    return sqrt * sqrt == n


def split_number(numbers: List[int], index: int) -> Optional[List[int]]:
    """Split a number by dividing it by 2."""
    if len(numbers) >= 4:
        return None
    num = numbers[index]
    # Only allow splitting even numbers >= 2
    if num < 2 or num % 2 != 0:
        return None
    new_numbers = numbers[:index] + numbers[index+1:]
    half = num // 2
    new_numbers.extend([half, half])
    return new_numbers


def square_root(numbers: List[int], index: int) -> Optional[List[int]]:
    """Take the square root of a perfect square."""
    num = numbers[index]
    if not is_perfect_square(num):
        return None
    
    new_numbers = numbers[:]
    new_numbers[index] = int(math.sqrt(num))
    return new_numbers


def add_numbers(numbers: List[int], idx1: int, idx2: int) -> List[int]:
    """Add two numbers together."""
    indices = sorted([idx1, idx2], reverse=True)
    result = numbers[idx1] + numbers[idx2]
    
    new_numbers = numbers[:]
    new_numbers.pop(indices[0])
    new_numbers.pop(indices[1])
    new_numbers.append(result)
    
    return new_numbers


def subtract_numbers(numbers: List[int], idx1: int, idx2: int) -> List[int]:
    """Subtract two numbers (absolute difference)."""
    indices = sorted([idx1, idx2], reverse=True)
    result = abs(numbers[idx1] - numbers[idx2])
    
    new_numbers = numbers[:]
    new_numbers.pop(indices[0])
    new_numbers.pop(indices[1])
    new_numbers.append(result)
    
    return new_numbers


def multiply_numbers(numbers: List[int], idx1: int, idx2: int) -> List[int]:
    """Multiply two numbers together."""
    indices = sorted([idx1, idx2], reverse=True)
    result = numbers[idx1] * numbers[idx2]
    
    new_numbers = numbers[:]
    new_numbers.pop(indices[0])
    new_numbers.pop(indices[1])
    new_numbers.append(result)
    
    return new_numbers


def divide_numbers(numbers: List[int], idx1: int, idx2: int) -> Optional[List[int]]:
    """Divide two numbers (larger by smaller)."""
    num1, num2 = numbers[idx1], numbers[idx2]
    dividend = max(num1, num2)
    divisor = min(num1, num2)
    
    if divisor == 0:
        return None
    
    quotient = dividend // divisor
    remainder = dividend % divisor
    
    indices = sorted([idx1, idx2], reverse=True)
    new_numbers = numbers[:]
    new_numbers.pop(indices[0])
    new_numbers.pop(indices[1])
    
    if remainder == 0:
        new_numbers.append(quotient)
    else:
        if len(new_numbers) + 2 > 4:
            return None
        new_numbers.extend([quotient, remainder])
    
    return new_numbers


def get_all_moves(numbers: List[int]) -> List[Tuple[List[int], str]]:
    """Generate all possible moves from the current state."""
    moves = []
    
    # Single number operations
    for i in range(len(numbers)):
        # Split
        result = split_number(numbers, i)
        if result:
            moves.append((result, f"Split {numbers[i]} → {result[-2]}, {result[-1]}"))
        
        # Square root
        result = square_root(numbers, i)
        if result:
            moves.append((result, f"√{numbers[i]} → {result[i]}"))
    
    # Two number operations (add, subtract, multiply only)
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            # Add
            result = add_numbers(numbers, i, j)
            moves.append((result, f"{numbers[i]} + {numbers[j]} → {result[-1]}"))
            # Subtract
            result = subtract_numbers(numbers, i, j)
            moves.append((result, f"{numbers[i]} - {numbers[j]} → {result[-1]}"))
            # Multiply
            result = multiply_numbers(numbers, i, j)
            moves.append((result, f"{numbers[i]} × {numbers[j]} → {result[-1]}"))
    return moves


def normalize_state(numbers: List[int]) -> Tuple[int, ...]:
    """Normalize state by sorting numbers for comparison."""
    return tuple(sorted(numbers))


def solve(start: int, target: int) -> Optional[List[Tuple[str, List[int]]]]:
    """
    Find the minimum number of steps to reach the target from start.
    Returns a list of (move_description, resulting_numbers) tuples.
    """
    # Accept both single and two-number starts for compatibility
    if isinstance(start, (list, tuple)):
        initial_state = list(start)
    else:
        initial_state = [start]
    if len(initial_state) == 1 and initial_state[0] == target:
        return []
    # BFS to find shortest path
    queue = deque([(initial_state, [])])
    visited: Set[Tuple[int, ...]] = {normalize_state(initial_state)}
    
    while queue:
        current_numbers, path = queue.popleft()
        
        # Check if we've reached the target
        if len(current_numbers) == 1 and current_numbers[0] == target:
            return path
        
        # Try all possible moves
        for new_numbers, move_desc in get_all_moves(current_numbers):
            normalized = normalize_state(new_numbers)
            
            if normalized not in visited:
                visited.add(normalized)
                new_path = path + [(move_desc, new_numbers)]
                queue.append((new_numbers, new_path))
    
    return None  # No solution found


def categorize_puzzles(combinations: List[Tuple[int, int]]) -> dict:
    """
    Categorize puzzles by difficulty based on minimum number of moves.
    
    Args:
        combinations: List of (start, target) tuples
    
    Returns:
        Dictionary with 'easy', 'medium', 'hard', and 'unsolvable' categories
    """
    results = {
        'easy': [],      # <=15 moves
        'medium': [],    # 16-40 moves
        'hard': [],      # >40 moves
        'unsolvable': [] # No solution found
    }
    
    for start, target in combinations:
        # Accept tuple/list for start (for two-number start)
        if isinstance(start, (list, tuple)):
            initial = start
        else:
            # If start is int, treat as single number (legacy)
            initial = [start]
        solution = solve(initial, target)
        if solution is None:
            results['unsolvable'].append((start, target, None))
        else:
            moves = len(solution)
            if moves <= 15:
                results['easy'].append((start, target, moves))
            elif moves <= 40:
                results['medium'].append((start, target, moves))
            else:
                results['hard'].append((start, target, moves))
    
    return results


def print_categorized_results(results: dict):
    """Print categorized results in a formatted way."""
    print("\n" + "=" * 60)
    print("PUZZLE CATEGORIZATION RESULTS")
    print("=" * 60)
    
    for category in ['easy', 'medium', 'hard', 'unsolvable']:
        puzzles = results[category]
        if not puzzles:
            continue
            
        print(f"\n{category.upper()} ({len(puzzles)} puzzles)")
        print("-" * 60)
        
        if category == 'unsolvable':
            for start, target, _ in puzzles:
                print(f"  {start} → {target}: No solution")
        else:
            for start, target, moves in puzzles:
                print(f"  {start} → {target}: {moves} moves")


def main():
    """Main function to test the solver."""
    import sys
    
    if len(sys.argv) >= 3:
        # Check if we have triples of arguments
        args = sys.argv[1:]
        if len(args) == 3:
            # Single puzzle mode, two-number start
            num1 = int(args[0])
            num2 = int(args[1])
            target = int(args[2])
            start = [num1, num2]
            print(f"Solving: {num1}, {num2} → {target}")
            print("=" * 50)
            solution = solve(start, target)
            if solution:
                print(f"\nFound solution in {len(solution)} steps:\n")
                print(f"Start: {start}")
                for i, (move, numbers) in enumerate(solution, 1):
                    print(f"Step {i}: {move}")
                    print(f"   Result: {numbers}")
                print(f"\n✓ Reached target: {target}")
            else:
                print("\n✗ No solution found")
        elif len(args) % 3 == 0:
            # Multiple puzzles mode - batch categorization, two-number start
            combinations = []
            for i in range(0, len(args), 3):
                num1 = int(args[i])
                num2 = int(args[i + 1])
                target = int(args[i + 2])
                # Ensure one odd and one even for each puzzle
                if num1 % 2 == num2 % 2:
                    # If both are odd or both even, adjust num2
                    num2 = num2 + 1 if num2 < 99 else num2 - 1
                combinations.append(((num1, num2), target))
            print(f"Analyzing {len(combinations)} puzzles...")
            results = categorize_puzzles(combinations)
            print_categorized_results(results)
        else:
            print("Error: Please provide triples of numbers (num1 num2 target)")
            sys.exit(1)
    else:
        # Default test case: two 2-digit numbers to a 3-digit target
        print("Default mode: Testing sample puzzles (2-digit start, 3-digit target)")
        combinations = [
            ((12, 34), 123),
            ((56, 78), 234),
            ((21, 99), 150),
            ((45, 67), 321),
        ]
        results = categorize_puzzles(combinations)
        print_categorized_results(results)


if __name__ == "__main__":
    main()
