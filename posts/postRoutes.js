const express = require('express');

const db = require('../data/db.js');

const router = express.Router();

// GET requests
router.get('/', (req, res) => {
    db.find()
        .then(post => {
            res.status(200).json(post);
        })
        .catch(err => {
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

router.get('/:id', (req, res) => {
    const postId = req.params.id;
    db.findById(postId)
        .then(post => {
            if (post.length < 1 || post == undefined) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else {
                res.status(200).json(post);
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be retrieved." });
        });
});

router.get('/:id/comments', (req, res) => {
    const postId = req.params.id;
    db.findCommentById(postId)
        .then(comments => {
            if (comments.length < 1 || comments == undefined) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else {
                res.status(200).json(comments);
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The comments information could not be retrieved." });
        });
});



// POST requests
router.post('/', (req, res) => {
    const newPost = req.body;
    // const allPosts = db.find();
    if (!newPost.title || !newPost.contents) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        db.insert(newPost)
            .then(post => {
                db.findById(post.id).then(postInfo => {
                    res.status(201).json(postInfo)
                });
            })
            .catch(err => {
                res.status(500).json({ error: "There was an error while saving the post to the database" });
            });
    }
});


router.post('/:id/comments', (req, res) => {
    const newComment = req.body;
    const postId = req.params.id;

    if (!newComment.text) {
        res.status(400).json({ errorMessage: "Please provide text for the comment." });
    } else {
        db.findById(postId).then(post => {
            if (post.length < 1 || post == undefined) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else {
                db.insertComment(newComment)
                    .then(comment => db.findCommentById(comment.id).then(commentInfo => {
                        res.status(201).json(commentInfo);
                    }))
                    .catch(err => {
                        res.status(500).json({ error: "There was an error while saving the comment to the database" });
                    });
            }
        })
    }
});

// DELETE request
router.delete('/:id', (req, res) => {
    const postId = req.params.id;
    db.remove(postId)
        .then(post => {
            if (post.length < 1 || post == undefined) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else {
                res.status(200).json({
                    message: "The post has been deleted"
                })
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The post could not be removed" });
        });
});


// PUT request
router.put('/:id', (req, res) => {
    const editedPost = req.body;
    const postId = req.params.id;
    if (!editedPost.title || !editedPost.contents) {
        return res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        db.findById(postId).then(post => {
            if (post.length < 1 || post == undefined) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else {
                db.update(postId, editedPost)
                    .then(post => {
                        res.status(200).json(post);
                    })
                    .catch(err => {
                        res.status(500).json({ error: "The post information could not be modified." });
                    });
            }
        })
    }
});

module.exports = router;