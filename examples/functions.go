func add(a int, b int) int {
    return a + b
}

func greet(name string) {
    Println("Hello, " + name + "!")
}

func main() {
    var sum int = add(10, 20)
    Println(sum)
    
    greet("World")
}

