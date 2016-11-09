﻿using System;
using System.Linq;
using Baseline;
using StoryTeller.Grammars.Sets;
using StoryTeller.Model.Persistence.Markdown;

namespace StoryTeller.Model.Persistence.DSL
{
    public class GrammarMode : IReaderMode
    {
        private readonly FixtureModel _fixture;

        private string _key;
        private string _title;

        private bool _hasAdded;

        public GrammarMode(FixtureModel fixture)
        {
            _fixture = fixture;
        }

        public int Indention { get; set; }

        public IReaderMode Read(int indention, string line)
        {
            if (_hasAdded) return null;

            if (line.IsHeaderTwo())
            {
                _key = line.Trim().TrimStart('#', ' ');
                return this;
            }

            if (line.IsHeaderThree())
            {
                _title = line.Trim().TrimStart('#', ' ');
                return this;
            }

            if (line.StartsWith("*"))
            {
                _hasAdded = true;

                var paragraph = new Paragraph
                {
                    key = _key,
                    title = _title
                };

                _fixture.AddGrammar(paragraph);

                var paragraphMode = new ParagraphMode(paragraph);

                return paragraphMode;
            }

            if (line.IsTableLine())
            {
                var values = line.ToTableValues();
                if (values.Any())
                {
                    switch (values[0].ToLower())
                    {
                        case "cell":
                            var sentence = addSentence();
                            return new SentenceMode(sentence);

                        case "table":
                            return buildTable();

                        case "set":
                            return buildSet(false);

                        case "ordered-set":
                            return buildSet(true);

                        case "embed":
                            return buildEmbed(values);

                        default:
                            throw new ArgumentOutOfRangeException($"'{values[0]}' is not a valid option here");
                    }
                }

                addSentence();
            }

            if (line.IsEmpty() && !_hasAdded)
            {
                addSentence();
            }

            return null;
        }

        private IReaderMode buildEmbed(string[] values)
        {
            _hasAdded = true;
            var embed = new EmbeddedSection
            {
                key = _key,
                title = _title,
                fixture = new FixtureModel(values[1])
            };

            _fixture.AddGrammar(embed);

            return null;
        }

        private IReaderMode buildSet(bool ordered)
        {
            _hasAdded = true;
            var @set = new SetVerification
            {
                key = _key,
                title = _title,
                ordered = ordered
            };

            _fixture.AddGrammar(@set);

            return new TableMode(@set);
        }

        private IReaderMode buildTable()
        {
            _hasAdded = true;
            var table = new Table
            {
                key = _key,
                title = _title,
            };

            _fixture.AddGrammar(table);

            return new TableMode(table);
        }

        private Sentence addSentence()
        {
            _hasAdded = true;

            var sentence = new Sentence
            {
                key = _key,
                format = _title
            };

            _fixture.AddGrammar(sentence);
            return sentence;
        }
    }
}