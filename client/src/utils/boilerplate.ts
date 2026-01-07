import { SupportedLanguage } from '../types/editor';

export const BOILERPLATE_CODE: Record<SupportedLanguage, string> = {
  javascript: `// JavaScript - Welcome to CodeLinka!
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`,

  python: `# Python - Welcome to CodeLinka!
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`,

  cpp: `// C++ - Welcome to CodeLinka!
#include <iostream>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::cout << greet("World") << std::endl;
    return 0;
}
`,

  java: `// Java - Welcome to CodeLinka!
public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
}
`,
};

export const getBoilerplate = (language: SupportedLanguage): string => {
  return BOILERPLATE_CODE[language] || '';
};
