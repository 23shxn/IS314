#!/usr/bin/env python3

import os
import re

def remove_java_comments(file_path):
    """Remove comments from a Java file"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove single-line comments
    content = re.sub(r'//.*', '', content)
    
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def remove_js_comments(file_path):
    """Remove comments from a JavaScript file"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove single-line comments
    content = re.sub(r'//.*', '', content)
    
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_java_files(directory):
    """Process all Java files in a directory"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.java'):
                file_path = os.path.join(root, file)
                print(f"Processing Java file: {file_path}")
                remove_java_comments(file_path)

def process_js_files(directory):
    """Process all JavaScript files in a directory"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                print(f"Processing JavaScript file: {file_path}")
                remove_js_comments(file_path)

if __name__ == "__main__":
    # Process backend Java files
    java_dir = "backend/src/main/java"
    if os.path.exists(java_dir):
        process_java_files(java_dir)
        print("Java files processed successfully.")
    else:
        print(f"Java directory not found: {java_dir}")
    
    # Process frontend JavaScript files
    js_dir = "FrontEnd/src"
    if os.path.exists(js_dir):
        process_js_files(js_dir)
        print("JavaScript files processed successfully.")
    else:
        print(f"JavaScript directory not found: {js_dir}")