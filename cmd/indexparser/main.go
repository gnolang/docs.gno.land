package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"
	"os"
	"regexp"
	"strconv"
	"strings"
)

type Category struct {
	Label string        `json:"label"`
	Items []interface{} `json:"items,omitempty"`
}

type Sidebar struct {
	TutorialSidebar []interface{} `json:"tutorialSidebar"`
}

const indexPath = "../../docs/README.md"

func main() {
	source, err := os.ReadFile(indexPath)
	if err != nil {
		panic(err)
	}

	gm := goldmark.New()
	node := gm.Parser().Parse(text.NewReader(source))
	node.Dump(source, 0)
	sidebar := Sidebar{
		[]interface{}{},
	}
	//ast.Walk(node, func(n ast.Node, entering bool) (ast.WalkStatus, error) {
	//	if !entering {
	//		return ast.WalkContinue, nil
	//	}
	//
	//	switch typ := n.(type) {
	//	case *ast.Heading:
	//		_ = typ.FirstChild().(*ast.Text).Value(source)
	//
	//	}
	//
	//	return ast.WalkContinue, nil
	//})

	sidebar.TutorialSidebar, err = Items(node, source, 0)
	if err != nil {
		panic(err)
	}

	res, err := json.MarshalIndent(sidebar, "", "\t")
	if err != nil {
		panic(err)
	}

	fmt.Println(string(res))
}

func Items(n ast.Node, source []byte, level int) ([]interface{}, error) {
	switch typ := n.(type) {
	case *ast.Heading:
		text := typ.FirstChild().(*ast.Text).Value(source)
		if typ.Level == 1 { // ignore h1
			return nil, nil
		}

		line := strings.Repeat("-", typ.Level) + string(text)
		return []interface{}{line}, nil
	case *ast.ListItem:
		if tb, ok := typ.LastChild().(*ast.Heading); ok {
			line := strings.Repeat("-", tb.Level) + string(tb.Lines().Value(source))
			return []interface{}{line}, nil
		}
	}

	items := []interface{}{}
	for c := n.FirstChild(); c != nil; c = c.NextSibling() {
		nextitems, err := Items(c, source, level+1)
		if err != nil {
			panic(err)
		}

		items = append(items, nextitems...)
	}

	return items, nil
}

func (i Item) String() string {
	return fmt.Sprintf("Name: %s\nLink: %s\n", i.name, i.link)
}

func extractCategoryName(line string) string {
	start := strings.LastIndex(line, "#") + 2
	return line[start:]
}

type Item struct {
	isCategory bool
	name       string
	link       string
	subItems   []Item
}

var re = regexp.MustCompile(`\[(.*?)\]\((.*?)\)`)

func heler() {

	// Open index file
	indexFile, err := os.Open(indexPath)
	if err != nil {
		panic(err)
	}
	defer indexFile.Close()

	scanner := bufio.NewScanner(indexFile)

	var topLevelItems []Item

	var prevDepth int

	var parents []Item

	// Scan file line by line
	for scanner.Scan() {
		line := scanner.Text()
		currDepth := strings.Count(line, "#")
		if currDepth < 2 {
			continue
		}

		var currentItem Item
		matches := re.FindStringSubmatch(line)

		if len(matches) == 3 {
			currentItem.isCategory = false
			currentItem.name = matches[1]
			currentItem.link = matches[2]

			fmt.Println("Parent: " + parents[len(parents)-1].name)
			parents[len(parents)-1].subItems = append(parents[len(parents)-1].subItems, currentItem)
		} else {
			currentItem.isCategory = true
			currentItem.name = extractCategoryName(line)

			if currDepth == 2 {
				topLevelItems = append(topLevelItems, currentItem)
			}

			parents = append(parents, currentItem)
			continue
		}

		// exiting a category
		if currDepth < prevDepth {
			fmt.Println("CURRDEPTH: " + strconv.Itoa(currDepth))
			fmt.Println("PREVDEPTH: " + strconv.Itoa(prevDepth))

		}

		prevDepth = currDepth
	}

	for _, item := range topLevelItems {
		fmt.Println("CAT: " + item.name)
		for _, subItem := range item.subItems {
			fmt.Println(subItem.String())
		}
	}
}
