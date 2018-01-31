#ifndef EXCEPTIONS_H_
#define EXCEPTIONS_H_

#include <string>
#include <iostream>
#include <memory>
#include <exception>

//#include <string.h>
#include <stdio.h>
#include <stdlib.h>


struct FileNotFoundException : std::runtime_error {
    inline FileNotFoundException() :std::runtime_error("") {}
    inline FileNotFoundException(const std::string& msg ) :std::runtime_error(msg) {}
};

// C++ exception for throwing new Java exceptions:
struct NewNSException : std::runtime_error {
    NewNSException(const char* type="", const char* message="");
};


// Function to swallow C++ exceptions and replace them with Java exceptions
void swallow_cpp_exception_and_throw_ns();

#endif