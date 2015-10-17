package main

import (
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

var port string

func main() {
	assetServer := http.NewServeMux() // Create a separate ServeMux for the asset files

	if len(os.Args) < 1 && strings.Contains(os.Args[1], "-port=") {
		port = strings.Replace(os.Args[1], "-port=", "", 1)
	} else {
		port = "4500" // The Port the server will run on
	}

	assetServer.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./assets")))) // Handle and Serve Static files from the assetServer ServeMux

	http.HandleFunc("/", serveGZIP(func(res http.ResponseWriter, req *http.Request) {

		res.Header().Set("Cache-Control", "public  ,max-age=0")

		if strings.Contains(req.URL.Path, ".") {
			assetServer.ServeHTTP(res, req)
		} else if req.URL.Path == "/" {
			readCopyServe("./assets/filebrowser.html", res, req)
		} else {
			errorCodeHandler(res, req, http.StatusNotFound)
		}

	}))

	http.HandleFunc("/files/", serveGZIP(func(res http.ResponseWriter, req *http.Request) {
		Dir := strings.Replace(req.URL.Query().Get("dir"), "~!", " ", -1)

		if exists(Dir) {
			res.Write(getDirInfoList(Dir))
		} else {
			res.Write([]byte("Invalid Path"))
		}

	}))

	http.HandleFunc("/getfile/", serveGZIP(func(res http.ResponseWriter, req *http.Request) {
		Dir := strings.Replace(req.URL.Query().Get("dir"), "~!", " ", -1)
		if Dir != "" && existsAS(Dir) == "file" {
			file, err := os.Open(Dir)
			if err != nil {
				errorCodeHandler(res, req, http.StatusNotFound)
			}
			io.Copy(res, file)
			file.Close()
		} else {
			res.Write([]byte("Invalid :  " + existsAS(Dir)))
		}

	}))

	fmt.Println("Go File-Browser Running on Port: " + port)

	// Listen on Chosen Port and check for errors
	errHTTP := http.ListenAndServe(":"+port, nil)
	check(errHTTP)
}

func readCopyServe(filename string, res http.ResponseWriter, req *http.Request) {
	file, err := os.Open(filename)
	if err != nil {
		errorCodeHandler(res, req, http.StatusNotFound)
	}
	io.Copy(res, file)
	file.Close()
}

// getLocalpath Simple function to get the Script/binarry's Current Directory path  as a String
func getLocalpath() string {
	localpath, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	return localpath
}

func exists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}

func existsAS(name string) string {
	Stat, err := os.Stat(name)
	if err == nil && !os.IsNotExist(err) {
		if Stat.Mode().IsDir() {
			return "directory"
		} else if Stat.Mode().IsRegular() {
			return "file"
		}
	}
	return "invalid"
}

//FileInfo :  File Details Datatype
type FileInfo struct {
	Name    string
	Size    int64
	Mode    os.FileMode
	ModTime time.Time
	IsDir   bool
}

func getDirInfoList(Directory string) []byte {
	dir, err := os.Open(Directory)
	check(err)
	entries, err := dir.Readdir(0)
	check(err)

	list := []FileInfo{}

	for _, entry := range entries {
		f := FileInfo{
			Name:    entry.Name(),
			Size:    entry.Size(),
			Mode:    entry.Mode(),
			ModTime: entry.ModTime(),
			IsDir:   entry.IsDir(),
		}
		list = append(list, f)
	}

	output, err := json.Marshal(list)
	check(err)

	DirInfoList := output
	return DirInfoList
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	if "" == w.Header().Get("Content-Type") {
		// If no content type, apply sniffing algorithm to un-gzipped body.
		w.Header().Set("Content-Type", http.DetectContentType(b))
	}
	return w.Writer.Write(b)
}

func serveGZIP(fn http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		if !strings.Contains(req.Header.Get("Accept-Encoding"), "gzip") {
			fn(res, req)
			return
		}
		res.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(res)
		defer gz.Close()
		gzr := gzipResponseWriter{Writer: gz, ResponseWriter: res}
		fn(gzr, req)
	})
}

func errorCodeHandler(res http.ResponseWriter, r *http.Request, status int) {
	res.WriteHeader(status)
	if status == http.StatusNotFound {
		fmt.Fprint(res, "Error 404 , What you're lookin for... , well it ain't here")
	}
}
