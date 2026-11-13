# Care Unlimited – Content Guide

How to change the words, pictures and videos on the website. No programming needed, just careful typing.

**Contents:** [The big picture](#1-the-big-picture) · [Writing settings](#2-writing-settings) · [Writing text](#3-writing-text-markdown) · [Pictures](#4-pictures) · [Videos](#5-videos) · [How a page is built](#6-how-a-page-is-built) · [Block types](#7-block-types) · [The pages of this site](#8-the-pages-of-this-site) · [Adding or removing pages](#9-adding-or-removing-pages) · [When something looks wrong](#10-when-something-looks-wrong) · [Cheat sheet](#11-cheat-sheet)

---

## 1. The big picture

The website is made from plain text files in the **`content`** folder. One file is one page. Change the text in a file, save it, and the website updates. **Every page works the same way**: there are no special page types hidden in the software. What a page looks like is decided entirely by the settings in its file.

| Folder | What lives there |
|---|---|
| `content/` | One file per page, plus `site.md` (details used on every page) |
| `content/<page name>/` | Extra blocks for that page (for example `content/services/` holds blocks for `services.md`) |
| `content/home/` | The blocks that make up the home page |
| `assets/imgs/<page>/` | Pictures used by that page (for example `assets/imgs/about/`) |
| `assets/imgs/site/` | Site-wide pictures, such as the logo and favicon |
| `assets/vid/` | Video files you upload yourself (optional) |

**Every content file has two parts**, separated by a line of three dashes:

```
---
title: About Us
banner: about/about-banner.png
---
Care Unlimited commenced in 2015. It saw the need for support for our older citizens.
```

- **Top part, between the two `---` lines: the settings.** Short labelled facts about the page: its title, its banner picture and so on. Written as `name: value`. (Programmers call this "front matter".)
- **Bottom part: the text** that visitors read, written in **Markdown**, a simple way of marking up text (section 3).

### Four golden rules

1. **Change only what comes after the colon.** Words like `title:` and `banner:` are the site's instructions. If you rename or delete them, that setting stops working.
2. **Keep the layout exactly as it is:** the `---` lines, the spaces, the indentation.
3. **File names must match exactly**, letter for letter, including capital letters and the ending (`.jpg` is not `.jpeg`). `Photo.jpg` and `photo.jpg` are different files.
4. **Change one thing at a time** and check the page. It's much easier to find a slip.

---

## 2. Writing settings

The settings are the part at the top, between the `---` lines.

### The basics

```
---
title: Service Coverage
banner: services/services-banner.png
description: Financial operations, health management and more for senior citizens in Kolkata.
---
```

- The **first line of the file** must be `---`, and the settings must end with another `---`.
- One setting per line: **name, a colon, a space, then the value.** `title:Home` (no space) is wrong; `title: Home` is right.
- A line starting with **`#`** is a note to yourself. It is ignored: `# this is a comment`.
- To leave a setting empty, write two quote marks: `favicon: ""`.

### When to put "quote marks" around a value

Wrap the value in **straight double quotes** if it contains a **colon**, a **`#`**, or **starts with** a symbol such as `[`, `{`, `*`, `&`, `!`, `|`, `>`, `%` or `@`.

```
tagline: "Attention | Care | Respect"
description: "Our hours: Monday to Friday"
```

Use straight quotes `"like this"`, not curly ones `“like this”`. Apostrophes inside are fine: `"Care Unlimited's story"`.

### Lists

A setting can hold a **list**. Both of these mean the same thing, and you will see both in the files:

```
address:
  - 7, Aswini Dutta Road, Ground Floor
  - Kolkata - 700 029
```

```
sections: [philosophy, about, commitment]
```

- In the **dash style**, each item starts with `- ` and sits **2 spaces in** from the setting name. Items can contain commas freely.
- In the **square-bracket style**, items are separated by commas, so an item that itself contains a comma must be in quotes: `[Banking, "Friend, counsellor, guide"]`.

### Groups of labelled values

Many lists are made of little groups, such as a button with a `label` and a `url`. There are two ways to write them:

```
hero_buttons:
  - { label: Our services, url: /services/ }
  - { label: Contact us,   url: /contact/ }
```

```
social:
  - label: Facebook
    url: https://www.facebook.com/Care.Unlimited.Kolkata
  - label: YouTube
    url: https://www.youtube.com/channel/UCuMmwh-AIu2wRKxii0mPAYA
```

In the `{ ... }` style, if a label contains a comma, put the label in quotes. In the second style, the lines of one group line up under each other, so keep them lined up.

### Spacing

Use the **space bar** for indentation, never the Tab key. Two spaces per level.

---

## 3. Writing text (Markdown)

Everything below the settings is ordinary writing with a few marks added for formatting.

| You type | Visitors see |
|---|---|
| A blank line between blocks of text | Separate paragraphs |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `## A heading` | A large heading |
| `### A smaller heading` | A smaller heading |
| `[Our services](/services/)` | A link to another page of this site |
| `[Our Facebook page](https://www.facebook.com/…)` | A link to another website |
| `[Email us](mailto:care.unlimited@outlook.com)` | A link that opens an email |
| `[Call us](tel:+919874019729)` | A link that dials the number on a phone |
| `- an item` (one per line) | A bulleted list |
| `1. an item` (one per line) | A numbered list |
| `> a quotation` | An indented quotation with a coloured bar |
| `![A short description](imgs/about/photo.jpg)` | A picture (section 4) |

Points to remember:

- **A single line break does not start a new paragraph.** Press Enter **twice** (a blank line) to start one.
- **Headings:** start at `##`. Don't use a single `#`, because every page already shows its title as the main heading.
- **Some block types use headings as dividers.** In cards, question lists, picture galleries, testimonials and video cards, a heading starts a new item (section 7). So don't put extra headings inside an item.
- **Notes that visitors can't see:** `<!-- write a note here -->` in the text area. (In the settings area, use `#`.)
- Curly quotes (“ ” ‘ ’), dashes (– —) and accented letters can be typed normally.

### Reusing the details from `site.md`

Instead of typing the address, phone number or email again (and having to remember to change it everywhere), write a **placeholder**. The site fills in the current value from `content/site.md`:

| You type | Becomes |
|---|---|
| `{{ site.phone }}` | +91 9874019729 |
| `{{ site.email }}` | care.unlimited@outlook.com |
| `{{ site.address }}` | The address, one line per item |
| `{{ site.phone \| digits }}` | The phone number with the spaces removed, for dialling links |

```
[{{ site.phone }}](tel:{{ site.phone | digits }})
```

Any setting in `site.md` can be used this way (`{{ site.name }}`, `{{ site.tagline }}`, and so on). If the name after `site.` doesn't exist, the update stops with a message telling you which placeholder is wrong.

---

## 4. Pictures

**Putting a picture on the site**

1. Save the picture into **`assets/imgs/<page>/`** (for example, `assets/imgs/about/` or `assets/imgs/home/`).
2. Refer to it by its path relative to `assets/imgs/`, in one of two ways:
   - In the **settings**, write the page folder and file name: `image: home/commitment.png`
   - In the **text**, write `![Description](imgs/about/vision-msn.png)`, on a line by itself. The description is read aloud by screen readers for blind visitors, so say what the picture shows.

**Tips**

- Use lowercase names with no spaces: `kolkata-picnic-2026.jpg`, not `Kolkata Picnic (2).JPG`.
- **JPG** for photographs, **PNG** for drawings, logos and anything with text.
- Wide banner pictures work best around 1600 pixels wide. Please keep every picture under about 1 MB so pages load quickly on phones.
- **If a name doesn't match any file, the picture is simply left out.** Nothing else breaks. If a picture is missing, check the spelling, capital letters and ending.

**Where the main pictures are chosen**

| Picture | Where to set it |
|---|---|
| Logo (top left) | `logo:` in `content/site.md` |
| Small icon in the browser tab | `favicon:` in `content/site.md` (leave empty for an automatic "CU" icon) |
| Wide banner at the top of a page | `banner:` in that page's file |
| Background of a big top section | `hero_image:` in that page's file (section 6) |
| Picture beside a block of text | `image:` in that block's file |

---

## 5. Videos

There are two kinds, and either can be used almost anywhere you can write text.

### A YouTube or Vimeo video

Paste its web address **on a line by itself**, with nothing else on the line:

```
https://www.youtube.com/watch?v=Az30spdFtmw
```

Visitors see the video's picture with a play button. Clicking it opens the video in a large focused viewer (the same one the picture galleries use) and starts it playing. Esc, the × button, or a click outside the video closes it. A start time in the address (for example `&t=94s`) is honoured.

- It must be **alone on its line**. A link written as `[watch it here](https://youtu.be/…)` stays an ordinary link, which is handy when you want that.
- Short links (`youtu.be/…`) and normal links both work. Vimeo links look like `https://vimeo.com/76979871`.
- Vimeo videos show a plain dark box with a play button, because Vimeo doesn't provide a preview picture.

### A video file you upload yourself

1. Save the file in **`assets/vid/`**. It must be `.mp4` (best), `.webm` or `.ogv`.
2. In the text, on a line by itself, write:

```
![Welcome message from our founder](vid/welcome.mp4)
```

The words in the brackets describe the video for screen readers, and are shown as its caption in the viewer. Visitors see the video's first frame with a play button; clicking it opens the video in the same large viewer, with the normal player controls (pause, volume, full screen).

**Keep files small.** Anything over about 50 MB should go on YouTube instead (it can be set to "Unlisted"), then use the link.

### Videos in cards

The `videos` block type (section 7) makes a row of video cards. Each video is a heading with its description, and the video goes on its own line:

```
### Welcome message
A short hello from our founder.

![](imgs/home/welcome-poster.jpg)

[Watch video](vid/welcome.mp4)
```

- The line starting `[Watch video](…)` holds the video: a YouTube or Vimeo web address, or `vid/file.mp4`. The words in the brackets become the link text under the card.
- The `![](imgs/home/…)` line is **optional**. It replaces the automatic preview picture (for a video file, that is its first frame).
- Clicking a card opens its video in the large viewer. **The videos in one row of cards form a group:** once one is open, the left and right buttons (or the arrow keys) move to the previous or next video in that row. A video written into ordinary text opens on its own.

---

## 6. How a page is built

Every page, including the home page, is made the same way. A page file can contain:

1. **Page settings:** its title, address, banner and so on.
2. **Its own text**, shown in a style you pick with `type:` (section 7). If you don't pick one, it is shown as ordinary text.
3. **Extra blocks** (optional), listed in `sections:`. Each is another small file, shown below the page's own text, one after another. Backgrounds alternate white and pale blue automatically.

### Page settings

| Setting | What it does |
|---|---|
| `title` | The page's main heading, and its name in the browser tab |
| `slug` | The page's web address: `slug: about` gives `/about/`. Changing it breaks old links to the page, and `slug: ""` means the home page |
| `description` | One or two sentences Google may show under the page's name |
| `banner` | A wide picture across the very top (optional) |
| `type` | How the page's own text is shown (section 7). Default: `text` |
| `sections` | The extra blocks to show below, in order (see below) |
| `show_title: false` | Hides the page's main heading (optional) |

**A big top section (optional).** Instead of a plain heading, a page can start with a big coloured section, like the home page:

| Setting | What it does |
|---|---|
| `hero_title` | The big heading. When this is present it replaces the plain page heading |
| `hero_text` | The sentence beneath it |
| `hero_image` | A background picture (leave out for plain blue) |
| `hero_buttons` | Buttons under it: a `label` and a `url` each. The first is solid white, the rest are outlined |

### Extra blocks

```
sections:
  - success
  - gallery-of-events
```

Each name is a file in a folder named after the page, without the `.md`. For a page in `services.md`, the block `success` is the file `content/services/success.md`. (The home page's blocks are in `content/home/`.)

- **To add a block:** create the file, then add its name to the `sections` list. Use only lowercase letters, numbers and hyphens in the name.
- **To hide or reorder blocks:** remove a name from the list, or move it.
- Every block file has its own `type:` and settings, written exactly as in section 7.

---

## 7. Block types

The `type:` setting chooses how some text is displayed. It works the same everywhere: in a page file (for the page's own text) and in a block file. **Every type can be used on any page.**

In a block file, `title:` is the block's own heading. In a page file, the page `title` is already the main heading, so the type doesn't repeat it.

### `text`: plain writing (the default)

```
---
type: text
title: Our commitment
image: home/commitment.png
image_alt: Mission & Vision
image_position: right
cta: { label: Read more, url: /about/ }
---
To offer personalized service as per the needs of our elderly members.
```

| Setting | Meaning |
|---|---|
| `title` | The block's heading (blocks only) |
| `image` | A picture file name, shown beside the text (optional; with no picture the text takes a single column) |
| `image_alt` | A short description of the picture (optional) |
| `image_position` | `left` or `right` |
| `cta` | An optional button under the text: a `label` and a `url` |

The text can have several paragraphs, `##` headings, quotations, links, pictures and videos.

### `list`: ticked bullet points

Same settings as `text`. The text must be a bulleted list:

```
---
type: list
title: What We Do
image: home/what-we-do.png
---
- We build everlasting relationships with our elderly members.
- We provide them with a reliable support system.
```

### `cards`: a grid of boxes

```
---
type: cards
title: Our services
columns: 3
---
An introduction that appears above the boxes.

## Financial Operations

- Expense planning
- Banking Operations

## Health Management

- Accompany to doctor visits
- Medicine management
```

| Setting | Meaning |
|---|---|
| `columns` | How many boxes per row: `1` to `4` (default `3`). `1` gives wide boxes, one under another |

- Each **heading starts a new box**. Text before the first heading is the introduction.
- Inside a box you can use paragraphs, lists, bold and links. Three optional lines get special treatment: a line that is only a picture (`![](imgs/home/x.jpg)`) becomes the box's picture, a line wrapped in underscores (`_Founder_`) becomes a small subtitle, and a line that is only a link (`[Read more](/about/)`) becomes the box's "Read more →" link.
- Each box can be linked to from elsewhere by its heading (see `index` below).

### `accordion`: questions that open and close

```
---
type: accordion
schema: faq
---
## What is Care Unlimited?

Care Unlimited is an organization that provides non-critical care at home for the elderly.

## What services will be provided?

Our service offering covers **financial operations**, health management and engagement in life.
```

- Each **heading is a question**; the text under it is the answer (paragraphs, bold, lists and links all work).
- `schema: faq` is optional. It tells search engines these are frequently asked questions, which can help the page appear in search results. Leave it out for anything that isn't a Q&A.

### `gallery`: pictures that open in a large viewer

```
---
type: gallery
---
## Sananda

![Cover of the November 2016 issue](imgs/media/sananda/sananda-nov16-cover.jpeg)
![First page of the article](imgs/media/sananda/sananda-nov16-p1.jpeg)

## Your Health April 2018

![](imgs/media/your-health-april-2018/yh-apr18-cover.jpg)
![](imgs/media/your-health-april-2018/yh-apr18-p1.jpg)
```

- Each **heading starts a group** of small pictures. Each picture is a line `![description](imgs/media/<group>/file.jpg)`; the description is optional (the group's heading is used when it is empty).
- Clicking a picture opens a large viewer with left and right buttons to move through that group. Esc or the × closes it. Pictures appear in the order you write them.
- With no headings at all, all the pictures form one group.

### `videos`: cards with videos

```
---
type: videos
title: Memory Montage
channel: https://www.youtube.com/channel/UCuMmwh-AIu2wRKxii0mPAYA
---
A short introduction that appears above the cards.

### First video title
A sentence about the video.

[Watch video](https://www.youtube.com/watch?v=Az30spdFtmw)

### Second video title
Another sentence.

[Watch video](https://youtu.be/x1b6mzPX910)
```

- The text before the first heading is the introduction. Each heading starts a new card.
- `channel` adds a "Visit our YouTube channel" button; leave the line out for no button.
- Clicking a card opens its video in the large viewer, and the left and right buttons move between the videos in the row.
- More about the video line and the optional picture line in section 5.

### `testimonials`: quotes from families

```
---
type: testimonials
title: Testimonials
---
### Goutam Mukherjee
_Kolkata_

![](imgs/home/testimonials/t-goutam.jpg)

My 80+ year old mother-in-law stays alone in Gariahat area. Care Unlimited gave her ample support in every way.

### Jayeeta Banerjee Mukherjee
_Lives in USA, her mother availing our service for last 5 years_

Cannot thank Care Unlimited enough.
```

Each person is a heading with their **name**, then, in any order:

- one line wrapped in underscores, `_like this_`: who they are (shown under the name)
- one line that is only a picture, `![](imgs/home/testimonials/file.jpg)`: their photo (optional)
- the quotation itself: everything else

### `index`: links to the items on another page

```
---
type: index
source: social-support.md
title: Social Support
cta_label: Read more
---
A short sentence that appears above the links.
```

- `source` is the file name of **another page**. The block shows a link for every heading on that page, plus a button to the page. Add an item to that page and its link appears here too.
- `source` is required. `cta_label` is the button's wording (default: Read more).
- It works best with a page of `cards`, `accordion` or `gallery` type, because those give every item a link target.

### `form`: an enquiry form

```
---
type: form
title: Get in touch
button: Send message
fields:
  - { name: name,    label: Your name (required),  required: true, autocomplete: name }
  - { name: email,   label: Your email (required), type: email, required: true, autocomplete: email }
  - { name: phone,   label: Your phone no.,        type: tel }
  - { name: message, label: Your message,          type: textarea }
---
{{ site.address }}

[{{ site.email }}](mailto:{{ site.email }})
```

- The text below the settings appears **beside** the form (leave it out for a form on its own).
- Each field has a `name` (any short word, no spaces), a `label` (the words visitors see), and optionally `type` (`text` by default, or `email`, `tel`, `textarea`), `required: true` and `autocomplete`.
- `button` is the wording on the button.
- Where the form's messages go is set once, in `form_action` in `content/site.md`, by whoever looks after the site's technical side. **If it isn't set, visitors see an "Email us" button instead of the form.**

---

## 8. The pages of this site

| Page | File | How it's built |
|---|---|---|
| Menu, address, phone, email, footer | `content/site.md` | Settings only (below) |
| Home | `content/home.md` + `content/home/*.md` | Big top section, then these blocks: philosophy (`text`), about (`text`), commitment (`text`), why-us (`text`), what-we-do (`list`), memory-montage (`videos`), testimonials (`testimonials`), social-support (`index`) |
| About Us | `content/about.md` | `text` |
| Services | `content/services.md` + `content/services/success.md` | `cards` (4 columns), then one `text` block |
| FAQs | `content/faqs.md` | `accordion` with `schema: faq` |
| Social Support | `content/social-support.md` | `cards` (1 column) |
| Media | `content/media.md` + `content/media/press.md` | `gallery`, then one `text` block holding the press links |
| Contact Us | `content/contact.md` | `form`, with the address and phone beside it |

Because every page works the same way, changing a page's look is just changing its `type:`.

### `content/home.md`: the home page

```
---
slug: ""
title: Home
description: "Care Unlimited – Attention | Care | Respect."
hero_title: "Attention | Care | Respect"
hero_text: "Changing the experience of old age through active aging and meaningful engagement."
hero_buttons:
  - { label: Our services, url: /services/ }
  - { label: Contact us,   url: /contact/ }
sections:
  - philosophy
  - about
  - commitment
  - why-us
  - what-we-do
  - memory-montage
  - testimonials
  - social-support
---
```

**To reorder the home page**, move the names in `sections`. **To remove a block**, delete its name. **To add one**, create `content/home/my-block.md` and add `- my-block`.

### `content/site.md`: details used on every page

This file has settings only, no text underneath.

| Setting | What it does |
|---|---|
| `name` | The organisation's name |
| `tagline` | The slogan, used in the browser tab title of the home page |
| `description` | One or two sentences Google may show under the site name |
| `logo` | Logo file name in `assets/img` |
| `favicon` | Browser-tab icon file name; empty gives an automatic icon |
| `footer_blurb` | The sentence in the footer |
| `address` | List, one line per item |
| `phone`, `email` | Shown in the footer, and available as placeholders (section 3) |
| `social` | Footer links: a `label` and a `url` for each |
| `nav` | The menu: a `label` and a `url` for each item, in the order they appear |

```
address:
  - 7, Aswini Dutta Road, Ground Floor
  - Kolkata - 700 029
phone: "+91 9874019729"
nav:
  - { label: Home,       url: / }
  - { label: About Us,   url: /about/ }
  - { label: Contact Us, url: /contact/ }
```

The settings `url`, `form_action` and `form_netlify` are technical. **Leave them alone** unless the person who looks after the site's technical side asks you to change them.

---

## 9. Adding or removing pages

### A new page

1. Create a file in `content`, for example `content/events.md`:

```
---
title: Events
slug: events
banner: events/events-banner.png
description: Picnics, excursions and festival celebrations for our members.
---
We organise regular events for our members.

## Upcoming

- Winter picnic
- Durga Puja visit

## Photos

![Picnic last year](imgs/events/picnic.jpg)
```

2. Add it to the menu in `content/site.md`, where you want it to appear:

```
nav:
  - { label: Home,   url: / }
  - { label: Events, url: /events/ }
```

The menu address is `/` + the page's `slug` + `/`, so `slug: events` gives `/events/`. Use lowercase letters, numbers and hyphens in a slug.

**Don't want it in the menu?** Skip step 2. The page still exists at its address, and you can link to it from other pages like this: `[See our events](/events/)`.

### A page made of several different blocks

Add `sections` to the page, and create each block as a file in a folder with the **same name as the page**:

`content/events.md`:

```
---
title: Events
slug: events
type: accordion
sections:
  - photos
  - enquiries
---
## When is the next picnic?

Every second Sunday of the winter months.
```

`content/events/photos.md`:

```
---
type: gallery
title: Photos
---
## Last year's picnic

![Picnic](imgs/events/picnic.jpg)
```

`content/events/enquiries.md`:

```
---
type: form
title: Ask us about events
fields:
  - { name: message, label: Your message, type: textarea }
---
Call us on [{{ site.phone }}](tel:{{ site.phone | digits }}).
```

Here the page's own text is a question list, followed by a gallery and a form. Any combination of the types in section 7 works.

### Copying a page you like

Copy its file (and its folder of blocks, if it has one), give the copy a new name, change `slug` and `title`, then replace the content. Add it to the menu.

### Removing a page

Delete its file (and its folder of blocks, if any), and delete its line from `nav` in `content/site.md`. Anyone with an old link will see a "page not found" message.

### Renaming a page's web address

Change the `slug:` line **and** the matching menu line in `site.md`. Old links to the previous address will stop working.

---

## 10. When something looks wrong

| What you see | Most likely cause |
|---|---|
| The site didn't update, or an error names one of your files (and a line number) | A slip in the settings: a missing `---` line, a missing space after a colon, uneven indentation, a Tab instead of spaces (this can cause an error or be silently misread), or a value that needs quote marks. Compare with a working file |
| Error: `unknown type "…"` | The word after `type:` is misspelt. The message lists the valid ones: text, list, cards, accordion, gallery, videos, testimonials, index, form |
| Error: `"layout" is no longer used` | An old `layout:` line is still in the file. Delete it and use `type:` instead |
| Error: `Section file not found` | A name in `sections` has no matching file in the page's folder. Check spelling, and that the file ends in `.md` |
| Error: `{{ site.… }} is not defined` | A placeholder uses a name that isn't in `content/site.md` |
| A picture is missing | The file name doesn't match (check capital letters, spaces and `.jpg` vs `.jpeg`), or the picture isn't in `assets/imgs/<page>/` |
| A video link shows as ordinary blue text | The address must be **alone on its line**, and not written as `[text](address)` |
| A video file doesn't appear | Check the name and ending, that the file is in `assets/vid/`, and that the line is `![description](vid/file.mp4)` |
| Two paragraphs run together | Leave a **blank line** between them |
| A question, box or card is cut in two | A heading was used inside it. A heading always starts a new item |
| A testimonial has no subtitle or photo | The subtitle must be a single line wrapped in `_underscores_`, and the photo a line containing only `![](imgs/home/file.jpg)` |
| A card shows an unexpected link or subtitle | A line that is only a link, or only wrapped in underscores, is treated as the card's link or subtitle. Put other words on the same line to keep it as ordinary text |
| A menu item leads to "page not found" | The menu `url` must be `/` + the page's `slug` + `/`, for example `/about/` |
| A block you added isn't showing | Its name must be in the page's `sections` list, spelled the same as its file name |
| The form shows an "Email us" button | `form_action` isn't set in `content/site.md`. Ask whoever looks after the technical side |

A mistake in the settings stops the update before it goes live, and the error message names the file and the line. A misspelt picture name only means the picture is left out.

---

## 11. Cheat sheet

**Settings (top of the file)**

```
---
title: Page title
slug: page-address
type: text            # text | list | cards | accordion | gallery | videos | testimonials | index | form
sections: [one, two]  # extra blocks, in content/<page name>/
name: "value with a colon: needs quotes"
list:
  - first item
  - second item
group:
  - label: Home
    url: /
---
```

**Text (below the settings)**

```
Plain paragraph. Leave a blank line before the next one.

## Heading        ### Smaller heading
**bold**   *italic*
[link text](https://example.com)      [page on this site](/about/)
- bullet
1. numbered
> quotation
![describe the picture](imgs/about/file.jpg)
![describe the video](vid/file.mp4)
https://www.youtube.com/watch?v=VIDEOID        (alone on its line)
{{ site.phone }}   {{ site.email }}   {{ site.address }}
<!-- note nobody sees -->
```

**Remember:** only change what's after the colon · file names must match exactly · spaces, not Tab · blank line between paragraphs · a heading starts a new item in cards, questions, galleries, videos and testimonials.
