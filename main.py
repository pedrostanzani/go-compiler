import subprocess
import sys

def run_node_script(expression: str):
    try:
        result = subprocess.run(
            ['node', 'dist/index.js', expression],
            capture_output=True, text=True, check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr.strip()}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python main.py '<expression>'", file=sys.stderr)
        sys.exit(1)
    
    expression = sys.argv[1]
    output = run_node_script(expression)
    print(output)
