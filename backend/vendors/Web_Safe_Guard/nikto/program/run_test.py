import subprocess

def run_nikto(target_url, output_file=None, format_type="txt"):
    # Base command
    
    command = ["perl", "nikto.pl", "-h", target_url]
    
    # Add output file option if specified
    #if output_file:
    #    command.extend(["-o", output_file, "-Format", format_type])

    try:
        # Run the command and capture the output
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        
        # Print the standard output
        print("Nikto Output:\n", result.stdout)
        
        # Print any error messages
        if result.stderr:
            print("Nikto Errors:\n", result.stderr)
            
        return result.stdout
    
    except subprocess.CalledProcessError as e:
        print(f"Error running Nikto: {e}")
        return None

# Example usage
target = "https://team-codefinity.vercel.app/"
output = "nikto_results.html"
run_nikto(target, output_file=output, format_type="html")
